---
path: "/2014/05/22/behaviors-and-breakpoints"
date: 2014-05-25
title: "Behaviors and Breakpoints"
description: ""
draft: false
---

In addition to [learning about Xcode](http://www.pasanpremaratne.com/2014/05/16/becoming-an-xcode-power-user/), another takeaway from CocoaConf was how to use behaviors and breakpoints to improve my workflow.

## Behaviors

From the docs:

>A behavior preference pairs an event with a set of actions to perform in response to that event. Beyond providing visual and audible notification, these preference settings allow you to specify how Xcode responds to different types of events and conditions. For example, if a build fails you can have Xcode automatically save a snapshot, open the debug area in your workspace window, and run a script to perform clean-up operations.

Let's look at how a default behavior is set up to understand what's going on. Behaviors are set up in the Preferences menu under 'Behaviors'. Navigate to Pauses in the Running subsection of the menu on the left. The way this is setup, when a currently running scheme is paused for any reason (due to a breakpoint for example), Xcode automatically brings up the Navigator with the focus on the Debug Navigator as well as the Debugger showing current views.  

If you have common workflows, you can automatically set up behaviors so that you spend less time moving panels around and let Xcode do the work for you.  You can even set up custom behaviors and set key bindings to control them. A simple one I have set up is to go back to my default view of the standard editor once I'm done debugging. Pressing ⌘⌥+P hides the Debug Navigator, Utilites Panel and Debug area.

## Breakpoints

Something else I learned was that I was using breakpoints in the most basic way. Here's the tip of what breakpoints can really do.

### Global Exception Breakpoints 

For those who don't know what exactly an exception is as compared to an error, from the docs:

>Almost every app encounters errors. Some of these errors will be outside of your control, such as running out of disk space or losing network connectivity. Some of these errors will be recoverable, such as invalid user input. And, while all developers strive for perfection, the occasional programmer error may also occur.

>If you’re coming from other platforms and languages, you may be used to working with exceptions for the majority of error handling. When you’re writing code with Objective-C, exceptions are used solely for programmer errors, like out-of-bounds array access or invalid method arguments. These are the problems that you should find and fix during testing before you ship your app.

Try accessing an array with an index that's out of bounds. Your project crashes but Xcode doesn't really point you towards the problem. Exception breakpoints help you figure out the source of the problem by breaking either when it catches the exception or when the app throws an exception. 

In the Breakpoint Navigator, add an Exeption Breakpoint by hitting the plus button at the bottom left and selecting Exception Breakpoint. Now run the app again; the breakpoint will catch your exception and even place the pointer at the point right before the exception occurs whereas beforehand all we get is "terminating with uncaught exception of type NSException" and the pointer at our main function.

Exception breakpoints can be edited and provide a few more options, like catching all exceptions, Objective-C exceptions or C exceptions, breaking on throw versus on catch, debugger commands and more. 

### Symbolic Breakpoints

In addition to the standard and exception breakpoints, you can add symbolic breakpoints to your project. Symbolic breakpoints stop your program execution when a specific function or method is reached. The breakpoint takes a symbol such as a method name like viewDidLoad, a method of a particular class such as [alarmView setupClockLabels] or a function name. 

![image](https://cl.ly/0F2K2t3B1i0v/Image%202014-05-22%20at%2010.52.34%20PM.png)

Symbolic breakpoints are useful because they break everywhere where the symbol is reached. So if we set the symbol as viewDidLoad, it breaks everytime the system calls viewDidLoad. 

![image](https://cl.ly/253H2q2v3105/SymbolicBreakpointViewDidLoad.png)

### Custom Breakpoints

You can customize all your breakpoints to do even more.

1. **Condition**. Breakpoints take an optional condition that lets you fine tune when the break occurs. For example, if you had a random number generator and you wanted to break everytime the number was between a certain value you can enter something like 100 <= random_number <= 400.
2. **Ignore**. You can also tell the breakpoint to ignore certain conditions. If you had a loop that executed some function 12 times, you could tell the breakpoint to ignore the first 6 iterations of the loop and then break every time after.
3. **Action**. The action parameter on a breakpoint allows you to specify what you want to happen when you break. Options include running a debugger or shell command, a log message or event playing a sound. While this may sound useless (pun intended!), one of the better examples that Nathan mentioned was if you are trying to break on something that happens off the main thread. The audio cue lets you figure out exactly when it occurs.

Most of the information in this post comes from two talks [It's All In The Tools](https://speakerdeck.com/neror/its-all-in-the-tools) by [@neror](https://twitter.com/neror) and [Stronger, Better, Faster with Instruments and Debugging](http://f.cl.ly/items/3J0f3R1k2g0P3r460O2o/idevInstruments.pdf) by [@kylerichter](https://twitter.com/kylerichter).