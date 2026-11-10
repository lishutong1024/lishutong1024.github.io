<template><div><p>在RTOS中，当我们需要动态申请内存时，通常有两种机制可选：一种是动态内存分配；另一种是内存池。</p>
<p>以RT-Thread为例，这两种机制对应的主要接口如下：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665">rt_malloc</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965">rt_size_t</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> size</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_free</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">ptr</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> </span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965">rt_mp_t</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_mp_create</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">const</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> char</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">name</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965"> rt_size_t</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> block_count</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965"> rt_size_t</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> block_size</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> </span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665">rt_mp_alloc</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965">rt_mp_t</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> mp</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965"> rt_int32_t</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> time</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> </span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_mp_free</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">block</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>你可能会疑问：</p>
<blockquote>
<p>动态内存分配机制很好用啊，为什么还要整个内存池出来？
这俩到底有什么区别？分别在什么场景下用？</p>
</blockquote>
<p>在这篇文章中，我将简要介绍这二者的工作原理，并说明其区别和适用场合。</p>
<h2 id="动态内存分配工作原理" tabindex="-1"><a class="header-anchor" href="#动态内存分配工作原理"><span>动态内存分配工作原理</span></a></h2>
<p>首先，让我们来了解动态内存分配机制的工作原理。</p>
<p>在标准C库里，提供了malloc()和free()这两个函数，用于实现动态内存分配。关于这两个函数，相信很多同学都不陌生，此处不作介绍。</p>
<p>系统启动的时候，<strong>会留出一段连续的RAM空间，这段空间叫做堆</strong>，其工作原理如下：</p>
<blockquote>
<p>当调用malloc()的时候，堆管理器就在堆里找一块大小足够的空闲区域，分配给调用者，剩下的部分留着以后再分配。调用free()释放内存的时候，将这块内存标记成空闲，并且尽量和相邻的空闲块合并成一个大块。</p>
</blockquote>
<p>下图展示了一个堆的内部布局图，从图中可以看出：堆里的已分配块和空闲块是交错在一起的。蓝色的是已经分配出去的，绿色虚线的是空闲的。空闲的内存块通过链表进行连接。
<img src="@source/notes/tech/rtos100/memory/images/q32/动态内存分配堆布局.jpg" alt="动态内存分配堆布局">
这种方式的好处是灵活：<strong>按需分配，不管是8字节还是800字节，都能从堆里分配</strong>。不过，这种分配方式的问题也很明显：</p>
<ol>
<li><strong>分配速度慢，时间不确定</strong>：每次分配时都要查找，直至找到大小合适的空间再分配，释放的时候还要检查能不能合并，二者执行时间都是不确定的。</li>
<li><strong>会产生内存碎片</strong>：长期运行之后，会留下很多零碎的小空闲块。当想申请一块大内存的时候，却找不到一块连续的区域。</li>
</ol>
<p>虽然上面介绍的是标准C库的工作机制，但其同样适用于RT-Thread和FreeRTOS等系统。</p>
<h2 id="内存池工作原理" tabindex="-1"><a class="header-anchor" href="#内存池工作原理"><span>内存池工作原理</span></a></h2>
<p>为了避免动态内存分配带来的问题，RTOS通常会提供一种简单高效的机制：内存池。</p>
<p><strong>当程序启动的时候，先分配一大块RAM，将其预先切成N个大小完全相同的小块，这些小块通过链表链接起来</strong>，形成空闲链表。当任务需要内存的时候，就从空闲链表的头部摘下一块给它用；用完之后，再把这块挂回链表的头部。</p>
<p><img src="@source/notes/tech/rtos100/memory/images/q32/内存池布局.jpg" alt="内存池布局"></p>
<p>由于分配和插入都在链表头部进行，这使得该机制具备如下优点：</p>
<ol>
<li><strong>分配和释放都是O(1)</strong>：无需遍历整个链表，执行时间是固定的、并且非常快速。</li>
<li><strong>没有碎片问题</strong>：所有块大小固定，长期运行不会出现碎片问题。</li>
</ol>
<p>不过，这种方式有个缺点：<strong>每块大小固定，每次必须分配一整块，如果实际用不了那么多，就会浪费空间</strong>。</p>
<p>不过，对于嵌入式系统来说，任务对内存的需求往往是比较固定的，我们在设计阶段就知道每种数据大概需要多大空间，所以<strong>可以针对不同的需求创建不同块大小的内存池，这样就不容易存在浪费的情况</strong>。</p>
<p>比如说，一个系统里既有ADC数据采集，又有串口帧处理。由于ADC每次采集的数据和串口帧数据的大小也是固定的，那就可以分别创建两个内存池，分别给ADC和串口使用，具体示例代码如下：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* ADC数据结构体，每次采集的数据大小固定 */</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">typedef</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> struct</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> {</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    //. 略..</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965"> adc_data_t</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> </span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 串口数据帧结构体，一帧数据大小固定 */</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">typedef</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> struct</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> {</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    //. 略..</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965"> uart_frame_t</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> </span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">int</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> main</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> {</span></span>
<span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965">	rt_mp_t</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> adc_mp </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_mp_create</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">"</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D">adc_pool</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">"</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 64</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> sizeof</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965">adc_data_t</span><span style="--shiki-light:#999999;--shiki-dark:#666666">));</span></span>
<span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965">	rt_mp_t</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> uart_mp </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_mp_create</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">"</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D">uart_pool</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">"</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 32</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 72</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">	</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">	while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> {</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">	}</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">	return</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 0</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="两者的区别" tabindex="-1"><a class="header-anchor" href="#两者的区别"><span>两者的区别</span></a></h2>
<p>现在，我们可以将上述两种方式进行简单对比，对比如下表所示：</p>
<table>
<thead>
<tr>
<th>对比项</th>
<th>动态内存分配（malloc）</th>
<th>内存池（mp）</th>
</tr>
</thead>
<tbody>
<tr>
<td>块大小</td>
<td>任意大小，按需分配</td>
<td>固定大小，预先切好</td>
</tr>
<tr>
<td>分配速度</td>
<td>慢，需要搜索空闲块</td>
<td>快，O(1)，直接摘链表头</td>
</tr>
<tr>
<td>执行时间</td>
<td>不确定</td>
<td>确定</td>
</tr>
<tr>
<td>内存碎片</td>
<td>长期运行会产生</td>
<td>几乎没有</td>
</tr>
<tr>
<td>空间利用率</td>
<td>高，要多少给多少</td>
<td>块大小不匹配就会浪费</td>
</tr>
<tr>
<td>分配失败</td>
<td>返回NULL</td>
<td>可以阻塞等待</td>
</tr>
<tr>
<td>适用场景</td>
<td>大小不一、偶尔申请</td>
<td>大小统一、频繁申请释放</td>
</tr>
<tr>
<td>可以看到，<strong>内存池常常适用于块大小比较固定、申请释放比较频繁的场合；如果是大小比较随机的情况，就更适合使用malloc</strong>。</td>
<td></td>
<td></td>
</tr>
</tbody>
</table>
<h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2>
<p>综上所述，RTOS通常提供了动态内存分配和内存池这两种实现机制完全不同的内存管理方式。</p>
<p>动态内存分配按任意大小切割，灵活但慢，长期运行会产生碎片；内存池把大块RAM预先切成固定大小的块，申请释放时间确定、没有碎片，但块大小不匹配会浪费空间。在实际开发过程中，应根据实际的需求灵活选择其中一种方式。</p>
<hr>
<blockquote>
<p>如果你希望系统地学习RTOS底层原理，可以了解我的《RTOS开发与实战》课程。</p>
<p>课程不是简单地讲解FreeRTOS API的使用，而是带你从零开始编写一个RTOS内核，逐步实现任务管理、任务调度、上下文切换、同步与通信等核心机制，并通过一个远程温湿度监控设备项目，将操作系统原理应用到实际嵌入式开发中。</p>
<p>适合希望深入理解RTOS工作原理、提升嵌入式底层开发能力的同学。</p>
<p><VPLink href="/blog/diyrtos/">课程详情</VPLink></p>
</blockquote>
</div></template>


