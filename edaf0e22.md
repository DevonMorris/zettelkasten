---
date: 2022-02-20T21:35
tags:
  - nvim
  - eng
  - blog
  - pl-lua
---

# Post - Luasnip
I've been using [neovim](https://github.com/neovim/neovim) and have wanted to
get LSP snippets working with [nvim-cmp](https://github.com/hrsh7th/nvim-cmp)
for a while now. I finally figured out how to do it. The crux is you have to
"confirm" the snippet from `nvim-cmp`. The configuration looks like

```lua
local ls = require 'luasnip'
local cmp = require'cmp'
cmp.setup{
  sources = {
        ...
        { name = 'luasnip' },
        ...
  },
  mapping = {
    ...
    ["<C-l>"] = cmp.mapping(
      cmp.mapping.confirm {
        behavior = cmp.ConfirmBehavior.Insert,
        select = true,
      },
      { "i", "c" }
    ),
    ...
  },
  snippet = {
    expand = function(args)
      require'luasnip'.lsp_expand(args.body)
    end,
  },
  ...
}
```
and that's it! Now combined with [my snippet config](https://raw.githubusercontent.com/DevonMorris/dotfiles/7e12d5edb5312f23c27345e50e7f7627a6553aa3/.config/nvim/after/plugin/snippets.lua)
I can type, complete, and enter the snippet.
