---
layout: post
title:  "Installing Rust Offline"
date:   2018-04-29 14:00:00 +0000
tags: 
    - software
    - rust
icon: fa-desktop
---

[Rust](https://www.rust-lang.org/) is a really ambitious programming language that "runs blazingly fast, 
prevents segfaults, and guarantees thread safety." Who doesn't want to try this with a
headline like that? 

I wanted to use Rust on an offline Linux system, but it seemed like there isn't a nice guide to install Rust 
and some popular packages all in one go (like [Anaconda](https://anaconda.org/), 
though what I describe here is much more ghetto), so I decided to
summarize the procedure to install the Rust toolchain and some popular libraries 
all in one go on a system with no internet access.

To prepare the files to put onto the targetted unconnected Linux machine, you need
a Linux box that *is* connected to the net to fetch the necessary files and run
some commands.

### Obtaining the Rust Toolchain

Installing Rust on a normal connected machine is really easy: 
just use [`rustup`](https://www.rust-lang.org/en-US/install.html).
It's an amazing tool (I mean, if you're a new language, it's probably a good
idea to make it *extremely* easy to install), but it seems to only work when the machine is online.

There are standalone installers available in the [Other Rust Installation Methods](https://www.rust-lang.org/en-US/other-installers.html#standalone-installers) page.

If you're targeting Linux like me, you should probably download the 
`x86_64-unknown-linux-gnu` .tar.gz bundle and move it over to the target machine. 
It installs globally provided you have root access, and there doesn't really 
seem to be an option to install to one user, which there is an option to do if you use `rustup`.

### Obtaining Packages

The [Rust Playground](https://play.rust-lang.org/) is a simple website that
lets you run bits of Rust code and get immediate results all in the browser.
A neat thing about the Playground is that it supports the top 100 most popular
Cargo packages. The Playground code maintains a [`Cargo.toml`](https://github.com/integer32llc/rust-playground/blob/master/compiler/base/Cargo.toml)
that is automatically updated with the top 100 packages, so we'll use this to get 
some packages we might need in our offline setup.

Just having the `Cargo.toml` file is useless, so we need to turn them into actual
bits of code or blobs that we can use in our Rust code. On a connected machine,
running `cargo build` or any other build commands will automatically fetch
them from [crates.io](https://crates.io/), so we need to replace this functionality
with a local mirror that serves crates.

The following procedure takes a while to complete and is quite fiddly, so I 
made the [final archive file available for download here][1]. Skip to the next section
to see how to install this on your target machine.

[1]:/blob/rust_local_registry.tar.gz

To create your own local archive, you can use a handy dandy Cargo subcommand called 
[`cargo-local-registry`](https://github.com/alexcrichton/cargo-local-registry) that
you can install. Using the `Cargo.toml` file from the Playground, we can 
turn the declarations into actual `.crate` files. Install this on your 
connected machine.

I found the easiest way to get these crates was to make a temporary empty Rust project on your 
connected machine:

```
cargo new playground
```

Notice the name of the project, because that means we can use the `Cargo.toml` 
from the playground without modifying it.

Copy the `Cargo.toml` from the Playground, and generate `Cargo.lock`:

```
cd playground
curl https://raw.githubusercontent.com/integer32llc/rust-playground/master/compiler/base/Cargo.toml -O
cargo update
```

Then run `cargo-local-registry`:

```
cargo local-registry --sync Cargo.lock ../local_registry/
```

After that's done, you probably want to make a tar archive of the local registry
so you can easily move it over to the target system.

### Installing on the Target System

The following steps are to be run on the Target system. 

To reiterate, you need to move the Rust standalone installer and the local registry
archive you created earlier to the target machine.

Installing the Rust toolchain is super simple as explained earlier. Unarchive and run the 
`install.sh` script inside the root directory of the installer.

Next, unzip the local registry in a convenient location. You must then tell Cargo
on the target machine to use local registry instead of crates.io, by writing
a section on your Cargo config.

The [Cargo config can be in any one of these places](https://doc.rust-lang.org/cargo/reference/config.html#hierarchical-structure):

* `/projects/foo/bar/baz/.cargo/config`
* `/projects/foo/bar/.cargo/config`
* `/projects/foo/.cargo/config`
* `/projects/.cargo/config`
* `/.cargo/config`
* `$HOME/.cargo/config`

For the config to take effect for all users, it's probably best to put it on
`/.cargo/config`, or if you want it to take effect on just your user, on `$HOME/.cargo/config`.

Write the following in the config file, creating it if it doesn't exist already:

```
[source.offline]
local-registry = "/location/of/local/registry/here/"

[source.crates-io]
replace-with = "offline"
```

Don't forget to replace the `local-registry` field value with the actual location
of your local registry.

To test if it actually compiles, use the temporary `playground` Rust project we made earlier.
If you try to `cargo build` it, it will compile all 100 of those crates, and it's 
a good way to test. From my experience, you probably need to install `gcc` because 
of the `cc` crate, the OpenSSL development library because of (to nobody's surprise) 
the `openssl` crate, and `cmake` and `make` in addition.

Thank you to the people on the [Rust Discord](https://discord.me/rust-lang) for giving me guidance to get this working.