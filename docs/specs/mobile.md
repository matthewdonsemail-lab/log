---
title: "Mobile devices"
---

# Mobile devices

Real phones as a device layer: `log mobile android|apple <platform>`, one phone per account, USB phones over ADB and GeeLark cloud phones over the same ADB. Rules 8, 29, 105 and 167.

## Devices

### REQ-MOBILE-01: Every reachable Android phone is listed

`log mobile android devices` lists the USB phones `adb devices -l` answers with, and the GeeLark cloud phones GeeLark's own list answers with when its key is set. A missing adb or key is said beside the list, never a failure of the whole command.

Checked by: code and SubQ

### REQ-MOBILE-02: One phone per account, one account per phone, kept for good

`bind` gives an account its phone and keeps it in the bindings file. An account that already has a phone is refused `accountBound`, and a phone another account holds is refused `deviceTaken`. Binding the same phone again answers that it already has it. Only `unbind` removes a binding.

Checked by: code and SubQ

## Inspect

### REQ-MOBILE-03: A GeeLark phone is reached the way GeeLark documents

`inspect` on a GeeLark phone starts it, waits for its status to be started, turns ADB on, reads its ADB address and code, runs `adb connect` to that address and `glogin` with the code, then uses the same Android driver as a USB phone. Each step is said as it happens, and the first one that fails stops it with its own code.

Checked by: code and SubQ

### REQ-MOBILE-04: Inspect records the screen and taps nothing

`inspect` saves the phone's UI tree and a screenshot into a run folder through uiautomator2, and with `--open` only starts the platform's app first. It sends no tap, swipe or text.

Checked by: code and SubQ

### REQ-MOBILE-05: Apple is refused until it is built

`log mobile apple` is refused `appleNotBuilt`, naming the Mac worker with Appium XCUITest it needs.

Checked by: code and SubQ
