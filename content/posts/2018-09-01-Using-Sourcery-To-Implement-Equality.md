---
path: "/2018/09/01/using-sourcery-to-implement-equality"
date: "2018-09-01"
title: "Using Sourcery to Implement Equatable Conformance"
---

One of the most cumbersome things in Swift programming is having to implement `Equatable` conformance for enums. Let's use an example from a project I'm currently working on - [building an AST parser in Swift](http://www.pasanpremaratne.com/2018/08/31/improving-treehouse-code-challenges). In the project I use an enum to define tokens that encompass Swift's lexical grammar. A small snippet of the type looks like this.

```swift
public enum TokenType {
    case leftParen, rightParen
    case leftBrace, rightBrace
    case leftBracket, rightBracket
    case dot, comma, colon, semicolon
    case space(String)
    case eof
}
```

This is only a subset of the values the type will eventually define but implementing `Equatable` conformance already involves tedious work.

```swift
extension TokenType: Equatable {
    public static func ==(lhs: TokenType, rhs: TokenType) -> Bool {
        switch (lhs, rhs) {
            case (.leftParen, .leftParen): return true
            case (.rightParen .rightParen): return true
            case (.leftBracket, .leftBracket): return true
            case (.rightBracket, .rightBracket): return true
            case (.dot, .dot): return true
            case (.comma, .comma): return true
            case (.colon, .colon): return true
            case (.space(l), .space(r)): return l == r
            case (.eof, .eof): return true
            default: return false
        }
    }
}
```

There's nothing creative about this code snippet, it just needs to be done. There's also one minor problem with this approach - we're using a default case at the bottom to catch anything that doesn't pattern match with the cases we've specified. This reduces the power of the switch statement by removing the exhaustiveness check. If we add a new enum case but forget to add a pattern to go along with it our implementation of `Equatable` breaks.

To fix that we can use the placeholder pattern as detailed [here](https://oleb.net/blog/2017/03/enums-equatable-exhaustiveness/). This would mean additional cases that look like this:

```swift
switch (lhs, rhs) {
    // Previous patterns
    case (.leftParen, _): return false
    case (.eof, _): return false
}
```

In doing this we've got the exhaustiveness checks back but haven't lost any of the tedium. Thankfully we can fix this using a powerful metaprogramming tool named [Sourcery](https://github.com/krzysztofzablocki/Sourcery). Sourcery automates repetitive tasks by allowing you to specify [Stencil](https://github.com/stencilproject/Stencil) templates containing rules to generate boilerplate code.

Let's walk through how we would solve this issue by automating `Equatable` conformance for this particular enum. If you already have a project you'd like to test this with ahead and use that. I'm going to set up a test project to demonstrate this.

```bash
$ mkdir SourceryDemo && cd SourceryDemo
$ swift package init
```

In the `SourceryDemo.swift` file define the TokenType as follows.

```swift
public enum TokenType {
    case leftParen, rightParen
    case leftBrace, rightBrace
    case leftBracket, rightBracket
    case dot, comma, colon, semicolon
    case space(String)
    case eof
}
```

Next we're going [install](https://github.com/krzysztofzablocki/Sourcery#installation) Sourcery. There are several ways you can do this but I'm going to go with the easy route and use Homebrew.

```bash
brew install sourcery
```

Next, let's add a new file named `AutoEquatable.swift` to `Sources/SourceryDemo`. `AutoEquatable` is going to be an empty protocol that we'll use as a marker type.

```swift
protocol AutoEquatable {}
```

Let's also mark `TokenType` as conforming to this protocol.

```swift
extension TokenType: AutoEquatable {}
```

The rules we state in a bit will direct Sourcery to look for any types that conform to `AutoEquatable` in our Sources directory and auto-generate `Equatable` conformance for them. These rules are going to be defined as Stencil templates. In the `Sources/SourceryDemo/` subdirectories add a new `Templates` directory and add a `AutoEquatable.stencil` file.

If you've used a templating language with a web framework this should be intuitive to you. At the top of the file let's add a comment marker

```swift
// MARK: - AutoEquatable for Enums
```

Next we're going to define a Stencil for tag to iterate over all enums in the sources directory that are marked `AutoEquatable`

```
{% for type in types.enums where type.implements.AutoEquatable %}
```

At the bottom we'll close this tag off. 

```
{% endfor %}
```

Between these tags we're going to add the logic that will be applied to every enum. In an extension of each enum we'll add conformance to the `Equatable` protocol.

```swift
extension {{ type.name }}: Equatable {

}
```

When Sourcery reads this template it replaces `type.name` with the name of the actual enum. Inside the extension, we're going define the static equality function we need to implement for `Equatable`.

```swift
public func ==(lhs: {{ type.name }}, rhs: {{ type.name }}) -> Bool {}
```

Again, `type.name` is replaced with the actual type. Next we need to switch on each case. 

```swift
switch (lhs, rhs) {}
```

When we did this manually we added patterns for the various cases in the enum. We can iterate over all these cases using a nested for tag.

```
{% for case in type.cases %}
```

This part is a bit tricky because there are three scenarios we can run into:

- If a case does not have an associated value
- If an enum case has an associated value, we need to compare the values
- If the case has more than one associated value, we need to compare all the values

The first two are straightforward, so let's get them out of the way. 

```
{% if case.hasAssociatedValue %}case (.{{ case.name }}(let lhs), .{{ case.name }}(let rhs)):{% else %}case (.{{ case.name }}, .{{ case.name }}):{% endif %}
```

This one looks complex but basically says if a case has an an associated value then the case statement itself has to be defined along with associated values. 
For example if we were evaluating this particular case - `case space(String)`, then the template would generate a line that looked like this:

```swift
case (.space(let lhs), .space(let rhs)):
```

If we were evaluating a case like `leftParen` however, then we hit the else clause of this tag and generate a line of code as follows:

```swift
case (.leftParen, .leftParen):
```

Next we need to specify what we do in the body of the case statement. Again it matters if we have associated values or not. If we don't, all we need to do is return `true`.

```
{% ifnot case.hasAssociatedValue %}return true{% else %}
```

If we do have associated values, then we hit the else clause of this tag and now we need to consider if we have more than one associated value or just the one.

```
{% if case.associatedValues.count == 1 %}
```

If it does just have one we can compare the associated value on the left to the associated value on the right and return the result.

```swift
return lhs == rhs
```

If we have more than one associated value, that's when things get a tiny bit compilicated

```
{% else %}
```

This is one of the lesser known, and lesser used features of Swift, but when you have an enum with multiple associated values, you can refer to those arguments by number instead of name. This is because associated values are simply tuples of values. Given the following tuple for example:

```swift
let status = (202, "OK")
```

Since the values in the tuples are unnamed, we can refer to them by number.

```swift
status.0 // 202
status.1 // "OK"
```

We can use this feature to read associated values even when we don't know the argument names. Here's a simple example to highlight this

```swift
enum Foo {
    case bar(String, String)
}

func testFoo(_ a: Foo, _ b: Foo) -> Bool {
    switch (a, b) {
    case (.bar(let lhs), .bar(let rhs)):
        return lhs.0 == rhs.0 && lhs.1 == rhs.1
    default: return false
    }
}
```

We have an enum `Foo` that defines a single value `bar` which carries two associated values. When we use a switch statement to evaluate two instances of `Foo`, instead of naming every associated value, we can assign a single name to the tuple and refer to the tuple's arguments using ordered values.

Using this feature we can write a template tag to automatically generate checks for enum members that carry multiple associated values.

```
{% for associated in case.associatedValues %}if lhs.{{ associated.externalName }} != rhs.{{ associated.externalName }} { return false }
```

Having accounted for all three scenarios, we can close the inner for tag.

```
{% endfor %}return true
```

This encapsulates almost all of our logic so we'll close of the remaining tags as well.

```
    {% endif %}
    {% endif %}
{% endfor %}
```

The one remaining case is if we try to compare an enum that doesn't have any members and here we can return false

```
{% if type.cases.count > 1 %}default: return false{% endif %}
```

All that's left to do now is close off the tags.

```
    }
}
{% endfor %}
```

Let's test this out. In the terminal and at the project root, run the following command 

```bash
sourcery --sources ./Sources/SourceryDemo --templates ./Sources/SourceryDemo/Templates --output ./Sources/SourceryDemo/Autogenerated
```

Now if you navigate back to your project, you should find a new folder inside `Sources/SourceryDemo` named `Autogenerated`. Inside there are the fruits of our labor (coupled with Sourcery's magic) - a `AutoEquatable.generated.swift` file that contains full Equatable conformance for our enum.

Pretty neat huh? Sourcery is really powerful and in fact, we can make this better. Sourcery provides a guide on defining a more robust template for AutoEquatable that generates `Equatable` conformance for optional types, arrays, classes, structs, protocols and more. To add this power to your projects simply run

```bash
curl https://raw.githubusercontent.com/krzysztofzablocki/Sourcery/master/Templates/Templates/AutoEquatable.stencil >> ./path-to-auto-equatable-stencil
```

In addition, instead of having to run the sourcery command with arguments everytime, we can define a YAML file at the root that specifies all the arguments we listed above. At the project root, create a file named `.sourcery.yml` and paste the following in

```yaml
sources:
  - ./Sources/SourceryDemo
templates:
  - ./Sources/SourceryDemo/Templates
output:
  ./Sources/SourceryDemo/Autogenerated
```

Now all you need to do is run `sourcery` in the root folder to get auto generated goodness. This is just the start and there's a lot more you can do with Sourcery. As always, check the [docs](https://cdn.rawgit.com/krzysztofzablocki/Sourcery/master/docs/index.html).

