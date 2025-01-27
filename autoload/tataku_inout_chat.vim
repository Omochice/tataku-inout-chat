let s:save_cpo = &cpo
set cpo&vim

function s:load(bufname) abort
  const l:bufnr = bufadd(a:bufname)
  call bufload(bufnr)
  call setbufvar(bufnr, '&buftype', 'nofile')
  call setbufvar(bufnr, '&filetype', 'markdown')
  call deletebufline(bufnr, 1, '$')
  return l:bufnr
endfunction

function tataku_inout_chat#open_chat(bufname) abort
  const l:bufnr = s:load(a:bufname)
  execute 'tabedit' $'+buffer{bufnr}'
endfunction

let &cpo = s:save_cpo
unlet s:save_cpo
