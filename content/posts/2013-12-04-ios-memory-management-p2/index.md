---
path: "/2013/12/04/ios-memory-management-p2"
title:  "iOS Memory Management: Automatic Reference Counting"
date:   2013-12-04
draft: false
---

In our previous [post](http://www.pasanpremaratne.com/2013/09/01/ios-memory-management) we went over the basics of memory management and the
manual-retain-release model that was used before the introduction of
ARC. With the introduction of ARC, most of the practices under the
manual-retain-release model were automated, handing off the task of
memory management to the compiler. ARC automatically implements memory
management of objects and blocks in Objective-C without the programmer
having to explicitly insert retains and releases like before. It does
this by introducing new declared property attributes.

Strong
------

The first property attribute we're going to look at is strong. Strong is
a synonymous with retain under the manual-retain-release model, so the
following declarations are identical:

```objectivec
@property (retain) Person *aPerson;
@property (strong) Person *aPerson;
```

Under ARC, strong is the default for all types unless explicitly
specified otherwise. In a strong relationship, like with retain, one
object assumes ownership of another and it can share this ownership with
yet another object. If in `FirstViewController.m`, I had the following
property:

```objectivec
@property (nonatomic, strong) NSMutableArray *items;
```

I can pass this items array to a `SecondViewController` which assumes
shared ownership of the object. With the usage of strong, ARC
automatically increases and decreases the reference count when ownership
is shared or relinquished so that memory is properly allocated.

Weak
----

In contrast to strong we have the weak property attribute. While strong
relationships are owning relationships, i.e., an object cannot be
deallocated until all of its references are released, with weak
relationships, the source object does not retain the object to which it
has a reference. This weak reference to an object helps avoid what are
known as **strong reference cycles** (previously called retain cycles).
Let's take a brief segue to talk about reference cycles and why they are
important.

![Strong reference cycle](https://cl.ly/273m2c3D2T0r/reference_cycle_1.png)

In this example, we have a ViewController, the parent, and its child, a
TableViewController. If the relationship between the two were both
strong, then neither one could be deallocated because it is always owned
by the other. To solve this problem, we substitute one of the strong
references for a weak reference. This weak reference does not imply
ownership, since it's a non-owning relationship, and therefore doesn't
keep the object alive.

![No strong reference cycle](https://cl.ly/40310T1d1P3p/reference_cycle_2.png)

This is also how parent-delegate patterns work as well. The parent view
has a weak relationship to its delegate:

```objectivec
UITableView
@property (weak) id delegate;
```

While the delegate object has a strong one

```objectivec
Delegate object
@property (strong) UITableView *tableView;
```

![Diagram from Apple Docs](https://cl.ly/2S0F1G0S0l0O/relationships.png)


This means that once the delegate object is deallocated, it releases the
strong reference on `UITableView`.

So there you have it. Instead of having to remember to manually increase
and decrease the reference count of objects, ARC simplifies the process
with the use of the strong and weak property attributes. Why do we do
all this again? For the sake of proper memory management. Incorrect
memory usage can result in two types of problems:

-   Freeing or overwriting data that is still in use. This can corrupt
    your memory, crash your application and even corrupt your data.
-   Memory leaks. A memory leak occurs when memory is not freed up even
    though it is no longer in use. An application that has memory leaks
    uses ever increasing amounts of memory, which can result in slow
    performance and the app being terminated.

Even though it's a lot simpler to program with ARC watching over you,
you still have to remember to use the right property attributes - ARC
does not look out for strong reference cycles. As the docs say,
"judicious use of weak relationships will help to ensure you don't
create cycles".

Happy coding!