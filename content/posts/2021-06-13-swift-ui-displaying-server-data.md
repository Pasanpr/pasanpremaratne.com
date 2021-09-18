---
path: "/2021/06/13/swiftui-loading-server-data"
date: "2021-06-13"
title: "Displaying Remote Data with SwiftUI"
description: "Using async await with SwiftUI to display data"
draft: false
---

_Note: The code for this blog post can be found on [GitHub]() and is inspired by [Thomas Ricouard's](https://mobile.twitter.com/Dimillian) [MovieSwiftUI](https://github.com/Dimillian/MovieSwiftUI) project_

WWDC 2021 brought the long awaited (pun intended!) set of concurrency features to Swift including `async` and `await` among other really cool features. Let's take a look at a simple use case - displaying a list of data in SwiftUI. As a side-note I should point out that at the time of this writing I know fairly little about SwiftUI. If anything here is wrong please reach out to me! 

To fetch data from the network we need to write an asynchronous method. Pre iOS 15 you would define a completion handler using a `Result` type

```swift
func fetch<T: Decodable>(endpoint: Endpoint, completionHandler: ((Result<T, APIError>) -> Void)) {}
```

Swift 5.5 makes this much simpler by allowing us to declare a function as asynchronous. 

```swift
func fetch<T: Decodable>(endpoint: Endpoint) async throws -> MarvelResponse<T> {}
```

The function is marked asynchronous using the `async` keyword. When the compiler encounters an async function it suspends execution of the current function and works on the asynchronous code. Execution of the originating function resumes automatically on completion of the async code.

> Suspending and resuming code in your program lets it continue to make progress on short-term operations like updating its UI while continuing to work on long-running operations like fetching data over the network or parsing files.

Because the completion handler is no longer necessary the function can now return the data directly. In addition, the `Result` type was only used previously as a way to make the closure based API a bit more elegant. The function can now directly be marked as throwing allowing for a single error handling model throughout our code. Async errors are caught and handled in exactly the same way as synchronous errors.

Inside the function we can use the `async` equivalents all of the API we're familiar with - in this case the data task methods on `URLSession`

```swift
let (data, response) = try await URLSession.shared.data(for: request)
```

When calling a method marked with `async` the `await` keyword is used. The `await` keyword is used to mark the possible suspension point in code. Technically the `await` keyword isn't necessary since the compiler already knows this code runs asynchronously but having the keyword allows humans to understand exactly what the code is doing.

> Inside an asynchronous method, the flow of execution is suspended only when you call another asynchronous method—suspension is never implicit or preemptive—which means every possible suspension point is marked with await.

Because this method is an `async` method the data is returned directly from the function which means we can write much simpler code that doesn't nest callback closures. In this case, the method returns a tuple with the data from the network call and the response object. 

Like the method we defined, `data(for:)` is also marked as throwing so we need to use the `try` keyword. Since the calling function, `fetch(endpoint:)` is also a throwing function we don't need to actually handle the error and can rely on it being propagated to the call site. 

There is a subtle difference in how error handling works as a result of this change. When using a completion handler we could specify the type for the failure branch using either a specific error like `APIError` or the error protocol `Error` so that we can bubble any error up.

```swift
Result<T, APIError>
```

If `APIError` was defined as an enum you could guarantee that all errors were handled at the call site using a switch statement but you had to also define wrapper types to handle any errors you were propagating from API you called as shown below. 

```swift
enum APIError: Error {
  case networkingError(Error)
}
```

When marking a function as throwing you lose the ability to guarantee all possible errors are handled in a type safe way, but you can define error types that are much narrower in scope since inner errors are propagated automatically. The remainder of `fetch(endpoint:)` is as follows:

```swift
guard let httpResponse = response as? HTTPURLResponse else {
    throw APIError.noResponse
}

if httpResponse.statusCode == 200 {
    return try self.decoder.decode(MarvelResponse<T>.self, from: data)
} else {
    throw APIError.unsuccessfulResponse(stausCode: httpResponse.statusCode)
}
```

When using async/await, asynchronous code reads in exactly the same way as synchronous code which makes it much easier to reason about. To use this we're going to add a method to the view.

```swift
func loadData() {
    async {
        let response: MarvelResponse<Character> = try! await MarvelAPIService.shared.fetch(endpoint: .characters)
        self.characters = response.data.results
    }
}
```

The concept that's probably going to trip everyone up when using async/await is that you can only call an async function from an asynchronous context. To bridge this gap you need to wrap calls to function inside an `async` closure. 

When the function completes it returns an instance of the data fetched since async functions return data. Note that we have to use `try await` as well. This response is used to update the value of a `@State` property.

```swift
@State private var characters: [Character] = []
```

Finally to call the 

