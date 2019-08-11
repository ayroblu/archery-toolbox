Archery Toolbox
===============

[![Build Status](https://travis-ci.org/ayroblu/archery-toolbox.svg?branch=master)](https://travis-ci.org/ayroblu/archery-toolbox)
[![Coverage Status](https://coveralls.io/repos/github/ayroblu/archery-toolbox/badge.svg?branch=master)](https://coveralls.io/github/ayroblu/archery-toolbox?branch=master)

Just a quick outline of important things for archery

* Archery Calculator - calculate your sight marks
* Bow tuning
    * Alignment
    * Plunger tuning
    * Spine
    * Nocking point
    * Tiller - static and dynamic
    * Centre shot
* How to clout
* Bow efficiency?

How to build
------------
### gh-pages
- We use the HashRouter here, and have to set a basename of `/archery-toolbox`

```bash
yarn deploy
```

Check: https://ayroblu.github.io/archery-toolbox

### Personal page at server root
- Can use the normal browser router

```bash
yarn build
# copy files over
```
