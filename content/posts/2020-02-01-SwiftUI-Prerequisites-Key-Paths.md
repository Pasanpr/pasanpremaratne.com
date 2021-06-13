---
path: "/2020/02/10/swiftui-prerequisites-key-paths"
date: "2020-02-10"
title: "SwiftUI Prerequisites: Key Paths"
description: "Understanding the basics of smart key paths in Swift"
draft: false
---

I'm finally jumping on the SwiftUI train, albeit tentatively, but before I get started actually working with the framework there's a lot I need to catch up on - some basic prerequisites if you will.  In this series (if I actually get around to finishing it) I want to cover four key pieces of Swift that play a huge role in making SwiftUI feel like magic

- Key paths
- Property wrappers
- Function builders
- Opaque types

Let's start with key paths.

## Key Paths

While everything else in the aforementioned list was introduced with SwiftUI, key paths are not new. They were introduced in Swift 4, which is several Swift lifetimes ago. Technically though key paths originated in Objective-C as a means of accessing an object's properties as part of the key-value coding protocol. If an object was _key-value coding compliant_, you could use a String value to indirectly access a property.

```objc
id someValue = [myObject valueForKeyPath:@"foo.bar.baz"];
```

Since Swift was built on top of and used to interact with exclusively Objective-C API in the early days an implementation of key paths was necessary if you wanted to leverage the power of KVO. But it was messy. If you wanted to observe values on a Swift type, it had to inherit from `NSObject` and you had to mark these properties as `dynamic`. 

```swift
class Person: NSObject {
  dynamic var name: String = "Jane Appleseed"
  dynamic var age: Int = 50
}
```

Having to inherit from an Objective-C class meant that you were immediately limited. You could not observe values on any value types such as structs and enums nor could you use generic classes. Using an `NSObject` instance you could now observe values, albeit with API that was not very Swift like.

```swift
person.addObserver(self, forKeyPath: "name", options: NSKeyValueObservingOptions.New, context: &kvoContext)
```

What stands out immediately is that the key path argument takes a String literal. Since any value could be passed in, this violated the type safety contract that Swift sought enforce. Literally everyone complained about this. Not only did it not feel like bad Swift, but all the features of Objective-C KVO weren't even supported.

Swift 3 sought to improve on this this by introducing the `#keyPath` syntax. A key path expression was created by passing in a sequence of object properties. 

```swift
var user = Person(name: "Jane Appleseed", age: 42)
let personNameKeyPath = #keyPath(Person.name)
```

This improved the API in some ways - creating a key path expression meant that the compiler could verify that the property existed, but several disadvantages still remained. 
Key path expressions still relied on the Objective-C runtime which meant the object being observed needed to be an Objective-C class, or individual properties had to be exposed to the runtime. 

Despite the compile time check the key path was also ultimately resolved to a string, which meant a loss of type information. Key path APIs always returned a value of type `Any`

```swift
let username = user.value(forKeyPath: personNameKeyPath) // Any
```

Similarly because type information was not preserved you could use the key path API to inadvertently assign values of the incorrect type to properties.

```swift
user.setValue(10, forKeyPath: personNameKeyPath) // No compile time error
```

In addition, key path expressions could only be used on objects and not on collections or other subscriptable types. Lastly, it was not possible to refer to object properties without invoking them.

None of these might have seemed like a huge deal at the time, but with Combine and SwiftUI coming down the pipeline key paths had to be improved significantly.

## Smart Key Paths

Smart key paths were introduced in [SE-0161](https://github.com/apple/swift-evolution/blob/master/proposals/0161-key-paths.md) as a language feature for Swift 4 and needed to account for all the deficiencies of #keyPath expressions. 

- It needed to allow for easy property traversal
- They should be statically type safe and avoid awkward `Any` based API
- They should work with structs, enums and generic types in addition to classes
- Importantly, they should work on all platforms so that Swift could continue its plans for global domination

### Syntax

Let's work with the following example

```swift
struct Person {
  let name: String
  var age: Int
  let address: Address
  let friends: [Person]
  let pet: Pet?
}

struct Address {
  let street: String
}

struct Pet {
  let name: String
}
```

To create a key path you start with a backslash, followed by the base type and the property being observed using the standard dot syntax when referring to properties.

```swift
let nameKeyPath = \Person.name
```

If the base type can be inferred it can be omitted.

```swift
\.name
```

The backslash is a sigil or character that helps the compiler disambiguate between an execution of the property or a specification of a type property. If you go through the Swift Evolution proposal it says that other syntactical approaches were considered, but ended up being more confusing.

```swift
// Examples of other possible syntacical approaches
#Person.name // # already has established meaning with #if and #available
Person.name // Similar to referring to function type, but confusing if there is a type property of the same name
`Person.name
```

Like Objective-C key paths, Swift key paths can be composed in sequence

```swift
let streetAddressKeyPath = \Person.address.street
```

Because they are statically type checked, we can use optional chaining as well, which creates a key path of the right type (more on this in a bit).

```swift
let petNameKeyPath = \Person.pet?.name
```

Finally, key paths can also be used on collection or subscriptable types to access inner values.

```swift
let friendNameKeyPath = \Person.friends[0].name
```

### Accessing Values

Once you have a key path, you can use subscript notation to access the actual value on an instance.

```swift
let address = Address(street: "123 Street")
var person = Person(name: "Jane Appleseed", age: 42, address: address, friends: [], pet: nil)

let name = person[keyPath: nameKeyPath] // "Jane Appleseed"
```

You'll notice that I'm using a `keyPath` label inside the subscript; this is to make it distinct from regular subscripting. Key path subscript syntax can also be used to set values.

```swift
let ageKeyPath = \Person.age
person[keyPath: ageKeyPath] = 43
```

So far all the types I've defined have been value types and key paths have worked with no issues. They work just as well with reference types.

```swift
enum Make {
  case toyota
}

class Vehicle {
  let year: Int
  let make: Make
  
  init(year: Int, make: Make) {
    self.year = year
    self.make = make
  }
}

let car = Vehicle(year: 2009, make: .toyota)
let make = car[keyPath: \.make]
```

## Inner Workings

So how do key paths work? Unlike `#keyPath` expressions, "smart" key paths are represented by the `KeyPath` type which are a hierarchy of progressively more specific generic classes. 

**AnyKeyPath**

At the top of the hierarchy is `AnyKeyPath`, a fully type erased key path that can refer to any route through an object graph. If we were to keep a reference to multiple key paths across different objects, the type of the resulting key path is an array of `AnyKeyPath`

```swift
let anyKeyPaths = [\Person.address, \Pet.name]
```

**PartialKeyPath**

Next up in specificity is a partial key path, a key path that is only partially type erased. Where `AnyKeyPath` defines a key path that contains _any_ base type and _any_ value, a partial key path has a fixed base. This is evident from the generic class definition: `class PartialKeyPath<Root>`.

Partial key paths indicate that we know what the base type is but the values can be any property within the base. 

```swift
let personKeyPaths = [\Person.age, \Person.address.street]
```

Here we have two key paths that originate from the `Person` base type. The values that each key path defines is different - one is an `Int` value, the other `String`, but both are routed to from the `Person` base type.

**KeyPath**

Moving further down the hierarchy we have the `KeyPath` class, that defines a key path with a **specific** base type to a **specific** resulting value type: `KeyPath<Root, Value>`.

All of the key paths I defined earlier resulted in `KeyPath` instances.

```swift
let nameKeyPath = \Person.name
```

If you option click to inspect the generated type you can see that it is `KeyPath<Person, String>`. Because the compiler knows the type of the base and the resulting value it can do that sweet compile time checking we know and love.

```swift
let name = person[keyPath: nameKeyPath]
```

The type of `name` is always going to be `String` since the compiler knows what the resulting value is at the end of the key path. This avoids the awkwardness of `Any` values and having to use optional casting all over the place.

**WritableKeyPath**

Once the types of the base and value are known, the compiler can then guarantee whether the property is read only or read-write. Key paths of type `KeyPath` are read only. If you try to set the value of `person.name` in the previous example the compiler will yell at you.

```swift
person[keyPath: nameKeyPath] = "Jane A." // Cannot assign through subscript: 'nameKeyPath' is a read-only key path
```

Let's go back to to the type declaration and make `name` a `var` property. If you inspect the associated key path you'll notice that it is now of type `WritableKeyPath<Person, String>`.

Mutable value type bases or chained mutable value type bases will always result in a writable key path. The compiler can now guarantee that the type can be written into, and you don't to worry about having to annotate using `mutating`.

**ReferenceWritableKeyPath**

The counter part for classes is `ReferenceWritableKeyPath<Root, Value>`. A reference writable key path supports reading from and writing to the resulting value using reference semantics. With writable key paths, the compiler ensures that both the instance and the underlying property are mutable before allowing a write, but with reference writable key paths values can be written by invoking a property setter.

```swift
class WrapperView {
  var innerView: UIView
  
  init(view: UIView) {
    self.innerView = view
  }
}

let keyPath = \WrapperView.innerView
```

In this example the type of `keyPath` is `ReferenceWritableKeyPath<WrapperView, UIView>`. A reference writable key path can be created even if the base type is a value type, as long as the value being written into is a reference type.

## Dynamically Creating Key Paths

Key paths can dynamically form new key paths from other key paths by using the append method.

```swift
let nameKeyPath = \Person.name
let nameCountKeyPath = nameKeyPath.appending(path: \.count)
```

In this example I'm using the key path for `Person.name` to derive the key path for the count property on the resulting String value.

## Using Key Paths

Now that we know what key paths are and how they are created, what do we actually use them for?

If you think about a basic function of key paths - being able to refer to a property on a type without an instance of it, you can improve existing API and come up with new in many useful ways.

**Map & Filter**

The existing map function can be rewritten to take key path arguments instead values of a given type.

```swift
extension Sequence {
  func map<T>(_ keyPath: KeyPath<Element, T>) -> [T] {
    return map { $0[keyPath: keyPath] }
  }
}
```

Given a type and an array of instances

```swift
struct Post {
  let id: String
  let pubDate: Date
  let title: String
  let isDraft: Bool
}

let posts = [
  Post(id: "1", pubDate: Date(), title: "SwiftUI Part 1", isDraft: false),
  Post(id: "2", pubDate: Date().addingTimeInterval(100), title: "SwiftUI Part 2", isDraft: false),
  Post(id: "2", pubDate: Date().addingTimeInterval(200), title: "SwiftUI Part 3", isDraft: true),
]
```

You can use the key path variant of map to easily obtain all the post ids

```swift
let ids = posts.map(\.id)
```

This variant is so useful that as of Swift 5.2 it is now part of the language, introduced in [SE-0249](https://github.com/apple/swift-evolution/blob/master/proposals/0249-key-path-literal-function-expressions.md). As part of the implementation `\Root.value` can be used anywhere functions of `(Root) -> Value` are allowed, the filter function for instance

```swift
let drafts = posts.filter(\.isDraft)
```

The only limitation here is only key path literals are allowed for now. So this works

```swift
posts.filter(\.isDraft)
```

but not this

```swift
let isDraftKeyPath = \Post.isDraft
posts.filter(isDraftKeyPath)
```

The `sorted()` function is another function that would benefit from the concise key path based API. It is not part of the language yet, but you can find a version, along with other great examples in [John Sundell's post on key paths](https://www.swiftbysundell.com/articles/the-power-of-key-paths-in-swift/).

**Combine**

The Combine framework uses key paths in several places to keep the API concise and expressive. Here's a simple example

```swift
var subscriptions = Set<AnyCancellable>()
let url = URL(string: "https://someblog.com/posts")!

URLSession.shared.dataTaskPublisher(for: url)
  .map(\.data)
  .decode(type: [Post].self, decoder: JSONDecoder())
  .sink(receiveCompletion: { print($0) }, receiveValue: { posts in print(posts.count) })
  .store(in: &subscriptions)
```

If you've written asynchronous networking code you know how much of a pain this is using Foundation API. When you create a data task for a url, the completion handler has three arguments defined - data, response and an error. You have to inspect each value and do the usual dance.

With Combine, we can just map on the data using a key path and write far more readable code.

Another example is the `assign(to:on:)` operator. 

```swift
class ViewModel {
  var date: Date

  init(date: Date) { 
    self.date = date
  }
}

let viewModel = ViewModel(date: Date())

let cancellable = Timer.publish(every: 1, on: .main, in: .default)
  .autoconnect()
  .assign(to: \ViewModel.date, on: viewModel)
```

The assign to operator is used to update the `date` property on the `ViewModel` instance every time a new value is received. The key path API allows us to write code in a much more declarative manner, stating what we want to happen, rather than having to invoke property setters.

**SwiftUI**

Let's bring it back to SwiftUI, the point of this entire post. You're going to run into key paths all over the place, but given that they're not as tentpole a feature as function builders or property observers most posts just assume you know what's going on. 

You'll run into when setting and retrieving values from the environment object 

```swift
let contentView = ContentView().environment(\.managedObjectContext, context)

struct ContentView: View {
  @Environment(\.managedObjectContext) var viewContext

  // implementation...
}
```

They are also used when creating `ForEach` views, which require a key path specified as an identifier.

```swift
ForEach(reminders, id: \.self) { reminder in 
  // ...
}
```

Key paths ultimately play a role in allowing for a more declarative, expressive and concise API, part of what makes SwiftUI fun. That about covers it. In the next post in this series, we'll look at property wrappers.


