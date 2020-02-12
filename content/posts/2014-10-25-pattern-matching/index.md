---
path: "/2014/10/25/pattern-matching-swift"
date: "2014-10-25"
title: "Pattern Matching in Swift"
tags: ['swift']
description: ""
---

When playing around with Swift, something I'm trying hard to avoid is just
implementing Objective-C patterns in my Swift code. It's been tough,
especially since the community is only just figuring out how things should be done.

I've spent the past few days porting an incomplete project over to Swift in the
hopes of releasing my first 100% Swift app by the end of the month. I had a
simple method that updated a label every second with the time elapsed. Here's how
I had implemented it in Objective-C:

```objectivec
- (void)updateTimerLabel
{
    NSTimeInterval timeElapsed = [[NSDate date] timeIntervalSinceDate:self.startTime];
    self.timerLabel.text = [self stringFromTimeInterval:timeElapsed];
}

- (NSString *)stringFromTimeInterval:(NSTimeInterval)interval {
    NSInteger ti = (NSInteger)interval;
    NSInteger seconds = ti % 60;
    NSInteger minutes = (ti / 60) % 60;
    return [NSString stringWithFormat:@"%02ld:%02ld", (long)minutes, (long)seconds];
}
```

In Swift, I could have written this similarly using string
interpolation. That didn't seem like the Swift way to do things however. There
are a couple cases you have account for (prepending a zero to a minute or second
if it was less than 10) and string interpolation alone seemed clunky. Here's how I
ended up implementing it:

```swift
func updateTimerLabel() -> Void {
    let interval = NSDate().timeIntervalSinceDate(startTime)
    let (min, sec) = timeElapsedInSecondsAndMinutes(interval: interval)
    switch (min, sec) {
    case (0..<10, 0..<10):
        return contractionTimerLabel.text = "0\(min):0\(sec)"
    case (_, 0..<10):
        return contractionTimerLabel.text = "\(min):0\(sec)"
    case (0..<10, _):
        return contractionTimerLabel.text = "0\(min):\(sec)"
    default:
        return contractionTimerLabel.text = "\(min):\(sec)"
    }
}

private func timeElapsedInSecondsAndMinutes(#interval: NSTimeInterval) ->  (seconds: Int, minutes: Int){
    var seconds = Int(floor(interval % 60))
    var minutes = Int((interval / 60) % 60)
    return (minutes, seconds)
}
```

There are a couple interesting things going on here that aren't easy to do with
Objective C.

1. The implementation of my timeElapsed method is the same but rather than
returning a string with the values, I've returned a tuple with the minute and
second values.
2. In the updateTimerLabel() method I use pattern matching with a switch statement that switches on the tuple values. There are three different cases to account for:
  - When both minute and second values are less than 10, I need to prepend a zero to either value. To match this I use half open ranges `(a..<b)` to check that both the minute and
second value are less than 10.
  - When the minute value is above 10, but the second value is less than 10, I need
to prepend only the second value with zero. Swift lets me set up a case where I
can ignore the minute value by using an underscore `(_)` in place of a variable name.
  - Similarly I use an underscore for the second value, when I only care if the minute value is less than 10.
3. Finally when I've matched my cases, I use string interpolation to return the
relevant text to update the label.

This may not be the cleanest way to implement this but it certainly feels more Swifty.
It's hard rewiring your brain to do the exact same things but with new syntax. Fun stuff!