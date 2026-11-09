# agrawalvanshi20-ux.github.io

Personal site for Vanshika Agrawal. Jekyll, no plugins, no build step to run yourself.
GitHub Pages builds it automatically.

## Putting it live

1. On github.com, signed in as **agrawalvanshi20-ux**, create a new repository named
   exactly `agrawalvanshi20-ux.github.io`. Public. Do not tick "Add a README".
2. On the empty repo page, click **uploading an existing file**.
3. Drag in everything from this folder: `_config.yml`, `_layouts`, `_posts`, `assets`,
   `index.html`, `research.md`, `notebook.html`, `.gitignore`.
4. Commit.

Give it a minute or two, then open `https://agrawalvanshi20-ux.github.io`. Because the
repo is named after the account, Pages switches itself on. There is no setting to change.

If the page is blank after a few minutes, check the Actions tab for a red build. The
usual cause is a broken line in the front matter at the top of a file (the bit between
the `---` lines).

## Editing it

Everything can be edited on github.com directly: open a file, click the pencil, commit.

**Your details.** `_config.yml` holds the title and the footer links. Fill in `email`,
`linkedin` and `orcid` and they appear in the footer. Leave one empty and it stays hidden.

**The words on the home page.** `index.html`. The copy there is a first draft written
for you, so change anything that does not sound like you.

**Research interests.** `research.md`. Four stubs to replace as you write them.

**The notebook.** Add a file to `_posts` named `YYYY-MM-DD-title.md` starting with:

```
---
layout: post
title: "Your title"
summary: "One line for the list page."
---
```

Delete `_posts/2026-11-09-a-first-note.md` once you have written a real one.

## How the design works

The look is an immunofluorescence composite: a dark slide with saturated stain channels.
The hero is a canvas drawing that composites its three channels in sequence as the page
loads, then holds still.

Each section owns a channel colour, set by a class on the section:

| class          | colour  | used for            |
| -------------- | ------- | ------------------- |
| `section-dapi` | blue    | training, the route |
| `section-fitc` | green   | the notebook        |
| `section-cy3`  | magenta | research interests  |
| `section-cy5`  | orange  | now, Oxford         |

All colours, type sizes and spacing are variables at the top of `assets/css/main.css`.
Change them there and they change everywhere.

The hero drawing is `assets/js/field.js`. The cell count, sizes and the order the
channels appear in are the `push(...)` lines and the `REVEAL` block near the top.
Anyone with reduced motion turned on gets the finished image straight away.
