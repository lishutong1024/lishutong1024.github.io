<template><div><div class="hint-container tip">
<p class="hint-container-title">提示</p>
<p>同学，你好，欢迎学习本课程！本课程是介绍了FATFS文件系统模块的基本使用，是一门相对较简单的课程。</p>
<p>如果你对文件系统的实现比较感兴趣，也可以关注我的《<a href="https://wuptg.xetlk.com/s/VeHie" target="_blank" rel="noopener noreferrer">从0到1写FAT32文件系统</a>》课程。</p>
<p>欢迎转载本文章，转载请注明链接来源，谢谢！</p>
</div>
<p>本小节介绍以字符串的方式写入字符串，其与前面介绍地f_gets()函数功能正好相反。</p>
<h2 id="接口介绍" tabindex="-1"><a class="header-anchor" href="#接口介绍"><span>接口介绍</span></a></h2>
<h3 id="写字符串" tabindex="-1"><a class="header-anchor" href="#写字符串"><span>写字符串</span></a></h3>
<p>f_puts函数向文件写入一个字符串。</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">int</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> f_puts</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">  const</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> TCHAR</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">*</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> str</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD"> /* [IN] 字符串 */</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">  FIL</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">*</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> fp</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">           /* [IN] 文件对象 */</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>参数</p>
<ul>
<li><code v-pre>str</code>: 指向要写入的以空字符终止的字符串的指针</li>
<li><code v-pre>fp</code>: 指向打开的文件对象结构的指针。</li>
</ul>
<p>返回值</p>
<ul>
<li>当字符串成功写入文件时，返回写入文件的字符编码单元数。当由于磁盘已满或出现任何错误而失败时，将返回负值。</li>
<li>f_putc函数将一个字符写入文件。</li>
</ul>
<h3 id="写字符" tabindex="-1"><a class="header-anchor" href="#写字符"><span>写字符</span></a></h3>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">int</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> f_putc</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">  TCHAR </span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">chr</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">  /* [IN] 要写入的字符 */</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">  FIL</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">*</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> fp</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">     /* [IN] 文件对象 */</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>参数</p>
<ul>
<li><code v-pre>chr</code>: 要写入的字符。</li>
<li><code v-pre>fp</code>: 指向打开的文件对象结构的指针。</li>
<li></li>
</ul>
<h2 id="注意事项" tabindex="-1"><a class="header-anchor" href="#注意事项"><span>注意事项</span></a></h2>
<p>与f_gets()相同，f_puts()也存在\r\n转换的问题。只不过是在写入时，碰到\n是否会转换成\r\n。该功能的配置方法与f_gets()的配置相同。</p>
<div class="hint-container tip">
<p class="hint-container-title">提示</p>
<p>🔥 想从零开始理解RTOS原理、手写可运行RTOS内核？
👉 <a href="https://lishutong1024.cn/article/ceok23ne/" target="_blank" rel="noopener noreferrer">点击了解课程详情</a></p>
</div>
</div></template>


