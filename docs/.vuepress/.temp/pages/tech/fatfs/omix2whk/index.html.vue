<template><div><div class="hint-container tip">
<p class="hint-container-title">提示</p>
<p>同学，你好，欢迎学习本课程！本课程是介绍了FATFS文件系统模块的基本使用，是一门相对较简单的课程。</p>
<p>如果你对文件系统的实现比较感兴趣，也可以关注我的《<a href="https://wuptg.xetlk.com/s/VeHie" target="_blank" rel="noopener noreferrer">从0到1写FAT32文件系统</a>》课程。</p>
<p>欢迎转载本文章，转载请注明链接来源，谢谢！</p>
</div>
<p>本节课时介绍目录或文件删除，标准C库和Linux上相关接口有：</p>
<ul>
<li><a href="https://cplusplus.com/reference/cstdio/remove/" target="_blank" rel="noopener noreferrer">https://cplusplus.com/reference/cstdio/remove/</a></li>
<li><a href="https://linux.die.net/man/2/unlink" target="_blank" rel="noopener noreferrer">https://linux.die.net/man/2/unlink</a></li>
</ul>
<h2 id="应用场合" tabindex="-1"><a class="header-anchor" href="#应用场合"><span>应用场合</span></a></h2>
<p>在某些情况下，需要删除指定的或者目录，此时需要利用删除接口。FATFS提供了这样的接口。</p>
<h2 id="接口介绍" tabindex="-1"><a class="header-anchor" href="#接口介绍"><span>接口介绍</span></a></h2>
<p><code v-pre>f_unlink</code> 函数用于从存储卷中删除文件或子目录。以下是该函数的详细说明：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">FRESULT </span><span style="--shiki-light:#59873A;--shiki-dark:#80A665">f_unlink</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">  const</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> TCHAR</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">*</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> path</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">  /* [IN] 文件或子目录的名称 */</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul>
<li><code v-pre>path</code>：要删除的文件或子目录的路径</li>
</ul>
<p>返回值：</p>
<ul>
<li><code v-pre>FR_OK</code>：操作成功。</li>
<li><code v-pre>FR_DISK_ERR</code>：磁盘错误。</li>
<li><code v-pre>FR_INT_ERR</code>：发生了内部错误。</li>
<li><code v-pre>FR_NOT_READY</code>：文件系统不可用。</li>
<li><code v-pre>FR_NO_FILE</code>：文件或目录不存在。</li>
<li><code v-pre>FR_NO_PATH</code>：指定路径无效。</li>
<li><code v-pre>FR_INVALID_NAME</code>：无效的文件或目录名称。</li>
<li><code v-pre>FR_DENIED</code>：操作被拒绝。</li>
<li><code v-pre>FR_WRITE_PROTECTED</code>：存储卷处于写保护状态。</li>
<li><code v-pre>FR_INVALID_DRIVE</code>：无效的驱动器号。</li>
<li><code v-pre>FR_NOT_ENABLED</code>：FatFs模块未启用。</li>
<li><code v-pre>FR_NO_FILESYSTEM</code>：没有可用的文件系统。</li>
<li><code v-pre>FR_TIMEOUT</code>：操作超时。</li>
<li><code v-pre>FR_LOCKED</code>：文件或目录被锁定。</li>
<li><code v-pre>FR_NOT_ENOUGH_CORE</code>：内存不足</li>
</ul>
<h2 id="注意事项" tabindex="-1"><a class="header-anchor" href="#注意事项"><span>注意事项</span></a></h2>
<p>在使用该函数时，需要注意以下几点：</p>
<ul>
<li>无法删除具有只读属性（AM_RDO）的目录或者文件，只读意味着不能修改（包含删除）。如果仍然调用，则函数返回FR_DENIED，删除失败</li>
<li>无法删除非空目录。非空目录下可能有子文件或者子目录，如果需要删除目录，则需要采用先从最深层 的目录开始，依次往上把所有的文件及父目录删除，最后才能删除最顶层的目录</li>
<li>无法删除当前目录</li>
</ul>
<div class="hint-container tip">
<p class="hint-container-title">提示</p>
<p>🔥 想从零开始理解RTOS原理、手写可运行RTOS内核？
👉 <a href="https://lishutong1024.cn/article/ceok23ne/" target="_blank" rel="noopener noreferrer">点击了解课程详情</a></p>
</div>
</div></template>


