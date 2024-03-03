<script setup>
import { onMounted, ref, watch } from 'vue';
import markdownit from 'markdown-it';
import math_plugin from '@traptitech/markdown-it-katex';

const md = markdownit();

md.use(math_plugin, {"blockClass": "math-block", "errorColor" : " #cc0000"});

const math = ref(false)
const passage = ref(String.raw`---
__Advertisement :)__

- __[pica](https://nodeca.github.io/pica/demo/)__ - high quality and fast image
  resize in browser.
- __[babelfish](https://github.com/nodeca/babelfish/)__ - developer friendly
  i18n with plurals support and easy syntax.

You will like those projects!

---
# h1 Heading 8-)
## h2 Heading
### h3 Heading
#### h4 Heading
##### h5 Heading
###### h6 Heading


## Horizontal Rules

___

---

***


## Typographic replacements

Enable typographer option to see result.

(c) (C) (r) (R) (tm) (TM) (p) (P) +-

test.. test... test..... test?..... test!....

!!!!!! ???? ,,  -- ---

"Smartypants, double quotes" and 'single quotes'


## Emphasis

**This is bold text**

__This is bold text__

*This is italic text*

_This is italic text_

~~Strikethrough~~


## Blockquotes


> Blockquotes can also be nested...
>> ...by using additional greater-than signs right next to each other...
> > > ...or with spaces between arrows.


## Lists

Unordered

+ Sub-lists are made by indenting 2 spaces:
  - Marker character change forces new list start:
    * Ac tristique libero volutpat at
    + Facilisis in pretium nisl aliquet
    - Nulla volutpat aliquam velit
+ Very easy!

Ordered

1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa


1. You can use sequential numbers...

Start numbering with offset:

57. foo
1. bar


## Code

Indented code

    // Some comments
    line 1 of code
    line 2 of code
    line 3 of code


Block code "fences"

## Tables

| Option | Description |
| ------ | ----------- |
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

Right aligned columns

| Option | Description |
| ------:| -----------:|
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |


## Links

[link text](http://dev.nodeca.com)

[link with title](http://nodeca.github.io/pica/demo/ "title text!")

Autoconverted link https://github.com/nodeca/pica (enable linkify to see)


## Images

![Minion](https://octodex.github.com/images/minion.png)
![Stormtroopocat](https://octodex.github.com/images/stormtroopocat.jpg "The Stormtroopocat")

Like links, Images also have a footnote style syntax

![Alt text][id]

With a reference later in the document defining the URL location:

[id]: https://octodex.github.com/images/dojocat.jpg  "The Dojocat"


## Plugins

The killer feature of markdown-it is very effective support of
[syntax plugins](https://www.npmjs.org/browse/keyword/markdown-it-plugin).


### [Emojies](https://github.com/markdown-it/markdown-it-emoji)

> Classic markup: :wink: :cry: :laughing: :yum:
>
> Shortcuts (emoticons): :-) :-( 8-) ;)

see [how to change output](https://github.com/markdown-it/markdown-it-emoji#change-output) with twemoji.


### [Subscript](https://github.com/markdown-it/markdown-it-sub) / [Superscript](https://github.com/markdown-it/markdown-it-sup)

- 19^th^
- H~2~O


### [\<ins>](https://github.com/markdown-it/markdown-it-ins)

++Inserted text++


### [\<mark>](https://github.com/markdown-it/markdown-it-mark)

==Marked text==


### [Footnotes](https://github.com/markdown-it/markdown-it-footnote)

Footnote 1 link[^first].

Footnote 2 link[^second].

Inline footnote^[Text of inline footnote] definition.

Duplicated footnote reference[^second].

[^first]: Footnote **can have markup**

    and multiple paragraphs.

[^second]: Footnote text.


### [Definition lists](https://github.com/markdown-it/markdown-it-deflist)

Term 1

:   Definition 1
with lazy continuation.

Term 2 with *inline markup*

:   Definition 2

        { some code, part of Definition 2 }

    Third paragraph of definition 2.

_Compact style:_

Term 1
  ~ Definition 1

Term 2
  ~ Definition 2a
  ~ Definition 2b


### [Abbreviations](https://github.com/markdown-it/markdown-it-abbr)

This is HTML abbreviation example.

It converts "HTML", but keep intact partial entries like "xxxHTMLyyy" and so on.

*[HTML]: Hyper Text Markup Language

### [Custom containers](https://github.com/markdown-it/markdown-it-container)

::: warning
*here be dragons*
:::
`)
const passageHtml = ref(null)

const parsePassage = (passage) => {
  if (passage !== null) {
    passageHtml.value = md.render(passage)
  } else {
    passageHtml.value = null
  }
}

watch(passage, parsePassage)
parsePassage(passage.value)

const question = ref("This is an example of $c = \\pm\\sqrt{a^2 + b^2}$ a question. Berkan and pennywise chilling in an ally looking for their next victim. The question continues and this is more of the question. And more and more.")
const questionHtml = ref("")

const parseQuestion = (question) => {
  questionHtml.value = md.render(question)
}

watch(question, parseQuestion)

parseQuestion(question.value)

const sideOpen = ref(false)

onMounted(async () => {
  sideOpen.value = true;
})

const toggleSide = () => {
  sideOpen.value = !sideOpen.value;
}

</script>

<template>
  <div class="max-w-screen max-h-screen flex flex-col">
    <div class="w-full border-b-2 py-2 px-4 flex flex-row items-center gap-8 shadow-sm">
      <img src="/logo.png" class="h-10" />
      <div class="bg-gray-200 text-gray-700 p-1.5 text-sm rounded-md flex flex-row gap-2 items-center">
        satshark.com/j/ASJ8
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 fill-current" viewBox="0 0 256 256">
          <path
            d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z">
          </path>
        </svg>
      </div>
    </div>
    <div class="flex-1 flex flex-row w-full min-h-[calc(100vh-59px)]">
      <div
        :class="'flex flex-row justify-end border-r-2 transition-all bg-gray-50 overflow-hidden ' + (sideOpen ? 'w-1/3 scale-100' : 'w-0 scale-0')">
        <iframe src="https://www.desmos.com/calculator"
          :class="'w-full h-[calc(100%+48px)] -mt-[48px] ' + (math ? 'display-block' : 'hidden')"></iframe>
        <div
          :class="'overflow-auto h-full min-w-[33.33vw] p-8 prose prose-h1:font-bold prose-h1:text-xl prose-a:text-blue-600 prose-img:rounded-xl prose-headings:underline prose-headings:decoration-slate-300/30 prose-headings:underline-offset-4 prose-headings:decoration-4 ' + (math ? 'hidden' : 'display-block')"
          v-html="passageHtml">

        </div>
      </div>
      <div class="w-0 flex flex-row items-center">
        <button class="my-auto rounded-r-lg bg-gray-200 p-1" @click="toggleSide">
          <svg xmlns="http://www.w3.org/2000/svg"
            :class="'fill-gray-700 w-5 h-5 transition-all ' + (sideOpen ? 'rotate-180' : 'rotate-0')"
            viewBox="0 0 256 256">
            <path
              d="M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z">
            </path>
          </svg>
        </button>
      </div>
      <div class="flex-1 flex flex-col">
        <div class="flex flex-row flex-1 min-h-0">
          <div class="flex flex-col p-4 flex-1 gap-6 ml-12 overflow-auto">
            <div class="mt-4 mb-6 mr-12" v-html="questionHtml"></div>
            <button
              class="flex flex-row items-center gap-4 group border p-4 rounded-lg transition-all hover:bg-gray-100/50 mr-12 active:scale-[0.98]">
              <div
                class="rounded-full flex items-center justify-center font-bold bg-gray-50 border-2 min-w-8 min-h-8 w-8 h-8 group-hover:bg-white transition-all">
                A</div>
              <div class="text-left">Answer A</div>
            </button>
            <button
              class="flex flex-row items-center gap-4 group border p-4 rounded-lg transition-all hover:bg-gray-100/50 mr-12 active:scale-[0.98]">
              <div
                class="rounded-full flex items-center justify-center font-bold bg-gray-50 border-2 min-w-8 min-h-8 w-8 h-8 group-hover:bg-white transition-all">
                B</div>
              <div class="text-left">Answer A</div>
            </button>
            <button
              class="flex flex-row items-center gap-4 group border p-4 rounded-lg transition-all hover:bg-gray-100/50 mr-12 active:scale-[0.98]">
              <div
                class="rounded-full flex items-center justify-center font-bold bg-gray-50 border-2 min-w-8 min-h-8 w-8 h-8 group-hover:bg-white transition-all">
                C</div>
              <div class="text-left">Answer A</div>
            </button>
            <button
              class="flex flex-row items-center gap-4 group border p-4 rounded-lg transition-all hover:bg-gray-100/50 mr-12 active:scale-[0.98]">
              <div
                class="rounded-full flex items-center justify-center font-bold bg-gray-50 border-2 min-w-8 min-h-8 w-8 h-8 group-hover:bg-white transition-all">
                D</div>
              <div class="text-left">Answer A</div>
            </button>
            <div class="pr-12 w-full flex flex-row justify-center">
              <button
              class="bg-[#6ba6ff] text-white rounded-md px-6 font-bold p-1 mx-auto hover:scale-110 transition-all active:scale-100">Submit</button>
            </div>
          </div>
          <div class="w-1/3 border-l-2 bg-gray-50"></div>
        </div>
        <div class="min-h-64 overflow-auto border-t-2 bg-transparent flex flex-col gap-4 relative justify-center">
          <div class="absolute w-full h-full overflow-hidden">
            <div class="ocean h-[250%]" style="margin-top: -100px;">
              <div class="bubbles">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
          <div class="flex flex-row mx-4 z-[999] opacity-80">
            <div class="bg-[#dfdfdf] my-2.5 py-1 pl-2 pr-5 uppercase font-bold rounded-lg text-xs min-w-24 text-center">
              John</div><img src="/fin.png" class="-ml-5 scale-[0.9]">
          </div>
          <div class="flex flex-row mx-4 z-[999] opacity-80">
            <div class="bg-[#dfdfdf] my-2.5 py-1 pl-2 pr-5 uppercase font-bold rounded-lg text-xs min-w-24 text-center">
              Ian</div><img src="/fin.png" class="-ml-5 scale-[0.9]">
          </div>
          <div class="flex flex-row mx-4 z-[999] opacity-80">
            <div class="bg-[#dfdfdf] my-2.5 py-1 pl-2 pr-5 uppercase font-bold rounded-lg text-xs min-w-24 text-center">
              Berkan</div><img src="/fin.png" class="-ml-5 scale-[0.9]">
          </div>
          <div class="flex flex-row mx-4 z-[999] opacity-80">
            <div class="bg-[#dfdfdf] my-2.5 py-1 pl-2 pr-5 uppercase font-bold rounded-lg text-xs min-w-24 text-center">
              Adi</div><img src="/fin.png" class="-ml-5 scale-[0.9]">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>