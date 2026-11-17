# Weighted Cursor

**Live:** https://vishnuvsdevtech.github.io/weighted-cursor/

A pointer with mass. Not an eased transition and not a trailing line — a real
body on a spring-damper:

```
v += (target − pos) · k      v *= damping      pos += v
```

`k` is the weight the user feels: low `k` overshoots and settles like a heavy
object, high `k` is tight. The body squashes along its own velocity vector, which
is what the eye reads as momentum rather than lag.

Three details that make it read as an object instead of a delay:

1. **The ring is heavier than the dot.** Two different spring constants create
   parallax between them, so the cursor has depth.
2. **Magnetic controls.** The *target* is pulled toward nearby buttons, so the
   pointer appears to want to land there — agency without snapping.
3. **Idle cost is zero.** One `requestAnimationFrame` loop, transforms only, no
   layout reads except the magnet rects (6 elements).

Disabled entirely on touch (`hover:none`), where a custom cursor is just a lag.
