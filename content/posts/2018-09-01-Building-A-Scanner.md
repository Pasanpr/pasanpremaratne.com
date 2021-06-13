---
path: "/2018/08/31/building-ast-parser-part-1"
date: "2018-09-01"
title: "Building an AST Parser Pt 1: Scanning"
description: ""
draft: false
---

Before we get into the nitty gritty of writing the actual parser, let's get a lay of the land. Rob Nystrom does a great job with this and if you want the details you should check out [A Map of the Territory](https://www.craftinginterpreters.com/a-map-of-the-territory.html) chapter. I'll give you quick tour.

When we run or compile a text file containing source code there are a set of steps that take us to the machine code or bytecode that is eventually executed. The first step is scanning or lexing

> A scanner (or “lexer”) takes in the linear stream of characters and chunks them together into a series of something more akin to “words”. In programming languages, each of these words is called a token. Some tokens are single characters, like ( and ,. Others may be several characters long, like numbers (123), string literals ("hi!"), and identifiers (min).

The next step is parsing. Parsing takes the tokens built in the scanning step and transforms it into a tree data structure that better represents the nested nature of the language's grammer. 

After parsing there's static analyzing, generating intermediate languages and so on, none of which we'll get to in this series. I'll be doing that as I learn from the book but to solve the [problem](http://www.pasanpremaratne.com/2018/08/31/improving-code-challenges) at hand all I need is that tree structure which is commonly called an abstract syntax tree.

In the scanning step, which is what we'll focus on here, we're going to scan the source code and generate a series of tokens. Swift's [lexical grammar](https://developer.apple.com/library/ios/documentation/Swift/Conceptual/Swift_Programming_Language/LexicalStructure.html) is pretty complex so we're going to start really simple.

We'll build this tool as a Swift library so we'll start with

```bash
$ mkdir SwiftInspector
$ cd SwiftInspector
$ swift package init
```

By default the package manage will create a library (as opposed to an executable). If you'd like to work in Xcode you can follow this up with

```bash
$ swift package generate-xcodeproj
$ open SwiftInspector.xcodeproj
```

We'll start in here by creating a new file named `Token.swift`. Given source code like this

```swift
var foo = "bar"
```

We can split this up into four distinct pieces - `var`, `foo`, `=` and `"bar"`. We call each of these pieces a **lexeme** and in scanning or in lexical analysis our goal is to generate tokens for each lexeme. This seems like a simple bit of source code to parse but there's a fair bit going on here so we'll focus on defining tokens to represent single character lexemes. Inside `Token.swift` create the following type

```swift
public enum TokenType {
    // Single character
    case leftParen, rightParen
    
    case eof
}
```

For each token we're going to indicate what type of token it is and since there's a limited set defined in Swift's lexical grammar we can use an enum. 
Single character lexemes are the most straightforward to start with. As you will see in a bit, with lexemes that span multiple characters, generating a token means scanning forward until we can somehow determine the end of that particular lexeme. In a toy language this may be limited to whitespace, identifiers and so on but with a complex set of grammars like Swift we'll eventually need to expand this to account for multiline comments, multiline string literals and even arbitary whitespace when listing out array values.

Since we're taking baby steps here we're going to start by generating tokens for opening and closing parentheses. There's more than one way to approach token generation and I'm going to define tokens for individual characters like braces, brackets and parens. [SwiftFormat](https://github.com/nicklockwood/SwiftFormat), a command line Swift formatting tool, defines its own AST parser and the [approach](https://github.com/nicklockwood/SwiftFormat/blob/master/Sources/Tokenizer.swift#L121) there is to define tokens for start and ends of scope with associated values carrying the type of scope. So instead of an indivual token type for an opening paren `(`, the lexer would emit a token called `.startOfScope("(")`. I don't know which approach works better for my tool yet but we'll try the most straighforward approach first and refactor later if we need to.

We also need to generate a token when we reach the end of the source code and for that we'll define an end of file token type, `eof`.

Now we can define a type for Token. 

```swift
public struct Token {
    let type: TokenType
    let line: Int
    
    public init(type: TokenType, line: Int) {
        self.type = type
        self.line = line
    }
}
```

Token is fairly simple for now and defines the type of the token and the line number in the source file on which the lexeme was defined. Tokens typically carry information about column and line numbers so that when errors are reported we can direct users right to the spot they need to modify but line numbers should suffice for my needs. This way if I wanted to ask a student to do something on a specific line I can verify it in a generated token.

### Lexer

Once we have a token the next step is to define a lexer or a scanner that scans each character of the source code and generates a set of tokens. 

```swift
public final class Lexer {
    private let source: String
    private var tokens: Array<Token>

    init(source: String) {
        self.source = source
        self.tokens = []
    }
}
```

We'll initialize the lexer with the source code, which for now will be a String literal. Later on we'll define a separate initializer to accept a path to a file.

We'll also need a few variables to keep track of our position in the source code.

```swift
private var start = 0
public var current = 0
private var line = 1
```

`start` defines the start position, not of the file or source code, but the position of each lexeme. We'll need to keep track of the starting position of individual lexemes when we move to multi character lexemes. `current` defines the lexer's current scan position and `line` the line number we're currently on. As the lexer scans the source code we'll need a way to indicate that we've reached the end. Let's define a computed property for this

```swift
var isAtEnd: Bool {
    return current >= source.count
}
```

With these helper properties we can define a scan method.

```swift
public func scan() throws -> [Token] {
    while !isAtEnd {
        start = current
        let token = try tokenize()
        tokens.append(token)
    }
    
    let token = Token(type: .eof, line: line)
    tokens.append(token)
    return tokens
}
```

`scan()` will be a throwing method in the event we reach an invalid token. While we're not at the end of the file, we'll set `start` to `current`. The logic here is that after every lexeme is tokenized, we'll set `start` to `current` to identify the starting position of the following lexeme.

When we're at the start, let's call `tokenize()` to get a token back. If this succeeds, we'll add the token to the `tokens` array. Once the loop condition terminates and we reach the end of the file, we'll add the `eof` token to the array and return it.

So what happens in `tokenize()`? A lot actually so let's break it down.

```swift
private func tokenize() throws -> Token {}
```

The first thing we need to do is check the current character. To do this let's define two helper methods. First is a method to get any character from the source string by providing an offset distance from the start of the source.

```swift
/// Returns character at specified distance from the start of the source string
///
/// - Parameters:
///   - source: The string to scan through
///   - offset: The distance to the offset index
/// - Returns: UnicodeScalar at specified index position
public func character(in source: String, atIndexOffsetBy offset: Int) -> UnicodeScalar {
    let index = source.unicodeScalars.index(source.unicodeScalars.startIndex, offsetBy: offset)
    return source.unicodeScalars[index]
}
```

Since this is a library let's add some unit tests to make sure our function performs exactly as we expect. Add a new file to the SwiftInspectorTests group named `LexerTests.swift`. 

```swift
import XCTest
@testable import SwiftInspector

class LexerTests: XCTestCase {

    let source = "var abc = 1"
    
    lazy var lexer: Lexer = {
        return Lexer(source: source)
    }()
    
    func testCharacterAtIndexOffsetBy() {
        let first: UnicodeScalar = "v"
        let middle: UnicodeScalar = "b"
        let last: UnicodeScalar = "1"
        
        XCTAssertEqual(lexer.character(in: source, atIndexOffsetBy: 0), first)
        XCTAssertEqual(lexer.character(in: source, atIndexOffsetBy: 5), middle)
        XCTAssertEqual(lexer.character(in: source, atIndexOffsetBy: source.count - 1), last)
    }
}
```

Here we've defined a simple unit test to make sure that the characters specified at the offset indexes are the ones we get back. Hit `Cmd+U` to run the tests; everything should pass.

Back to `Lexer.swift`, let's define an `advance()` function.

```swift
/// Consume character at `current` position and return it
///
/// Moves current forward after consuming character at `current`
/// - Returns: UnicodeScalar value at source at position offset by `current`
public func advance() -> UnicodeScalar {
    // Consume character at current before moving current forward
    let c = character(in: source, atIndexOffsetBy: current)
    current += 1
    return c
}
```

As the documentation states `advance()` consumes the character at current, returns it and increments current. Let's add a test for this in `LexerTests.swift` as well.

```swift
func testAdvanceConsumesCharacterAndMovesForward() {
    XCTAssertTrue(lexer.current == 0)
    let c = lexer.advance()
    XCTAssertTrue(c == UnicodeScalar("v"))
    XCTAssertTrue(lexer.current == 1)
    
}
```

These methods are definitely implementation details of `Lexer` that we don't need to expose but remember that you can only test the public interface of an object. In addition, to properly test all of our code we need to avoid, as much as possible, manipulating hidden state inside of a function, passing all values as arguments instead. For example, inside `advance()`, we're manipulating the value of `current` and while we are testing this behavior, its much too tightly coupled to the internals of the lexer. Perhaps I'll fix this in a refactor.

Let's use these methods to provide an implementation for `tokenize()`. The first thing we need to do is to get the current character. We'll use the `advance()` method for this so that after getting the character back we'll move `current` forward.

```swift
let character = advance()
```

Next, we'll use a switch statement to switch on the value we just obtained. 

```swift
switch character {
    case "(": return Token(type: .leftParen, line: line)
    default: throw LexerError.invalidToken
}
```

If the character matches a opening or right parenthesis, we'll return a token instance representing it. In the default case, we'll assume the character we've consumed is invalid and we'll throw an error. We need to define a type for this, which we'll add to the top of the file.

```swift
public enum LexerError: Error {
    case invalidToken
}
```

This should be enough to scan a really simple string. Before we can do that though we need to add `Equatable` conformance to `Token` and `TokenType` so that we can compare them. 

```swift
extension TokenType: Equatable {
    public static func ==(lhs: TokenType, rhs: TokenType) -> Bool {
        switch (lhs, rhs) {
        case (.rightParen, .rightParen): return true
        case (.leftParen, .leftParen): return true
        case (.eof, .eof): return true
        default: return false
        }

    }
}

extension Token: Equatable {
    public static func ==(lhs: Token, rhs: Token) -> Bool {
        return lhs.type == rhs.type && lhs.line == rhs.line
    }
}

extension Token: CustomStringConvertible {
    public var description: String {
        return "\(type) - line: \(line)"
    }
}
```

Let's add a new file called `TokenTests.swift` to validate the tokens we get back from the scanning operation.

```swift
import XCTest
@testable import SwiftInspector

class TokenTests: XCTestCase {}
```

We'll start by testing the base case of an empty string as source. Running `scan()` on this should return a single EOF token.

```swift
func testEmptyString() {
    let input = ""
    let output: [Token] = [
        Token(type: .eof, line: 1)
    ]
    
    let lexer = Lexer(source: input)
    XCTAssertEqual(try! lexer.scan(), output)
}
```

For the next test case we'll look for a `leftParen` token.

```swift
func testSingleParen() {
    let input = "("
    let output: [Token] = [
        Token(type: .leftParen, line: 1),
        Token(type: .eof, line: 1)
    ]
    
    let lexer = Lexer(source: input)
    XCTAssertEqual(try! lexer.scan(), output)
}
```

Run your tests and everything should pass. Generating tokens for the remaining single character lexemes is no different. These are defined under the Punctuation section of the [Lexical Structure](https://docs.swift.org/swift-book/ReferenceManual/LexicalStructure.html#) document. Let's add them to our token type enum.

```swift
public enum TokenType {
    // Punctuation
    case leftParen, rightParen
    case leftBrace, rightBrace
    case leftBracket, rightBracket
    case dot, comma, colon, semicolon
    
    case eof
}
```

I'll leave it up to you to implement the logic for these tokens. As an aside you might be wondering why I've excluded characters like `=` or `+` above. While those are technically single character lexemes, the existence of lexemes like `==` and `+=` means we need to add some additional logic to the lexer to be able to handle it. All in due time.

In addition, you'll notice that to be able to run tests on the new token types we'll need to extend `Equatable` conformance to cover all the new cases. This is going to get really tedious as the type grows. I highly recommend using [Sourcery](https://github.com/krzysztofzablocki/Sourcery) to automate this and if you're interested you can read my follow up [post](http://pasanpremaratne.com/2018/09/01/using-sourcery-to-implement-equality).

In the next post in this series, let's tackle lexemes that longer than a single character.
