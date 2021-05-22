# Ensou

Ensou is a project aiming to become a broswer version of Synthesia. Current features include visualizing MIDI files, playing MIDI files with samples/ synths, customizing synths, adding effectors to audio, and other common music software functionalities such as looping, ranged loops, metronomes, tempo control. Not only Ensou supports playing with keyboards, MIDI keyboard is also supported.

## Notes
- Currently MIDI files downloaded from the server is downloaded straight from Google Cloud. If this ever becomes a problem, cache with CDNs.
- Due to the interactive nature of this app, React was definitely the wrong framework to work with. React is large and re-renders are heavy, affecting performance. A lot of useMemo has been used to avoid renders but this signifies that React has been the wrong choice.

![alt text](https://pralphv.com/images/gifs/ensou.gif)
