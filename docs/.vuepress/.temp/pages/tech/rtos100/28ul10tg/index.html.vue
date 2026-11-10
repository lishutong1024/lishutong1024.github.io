<template><div><p>很久以前，当我第一次接触RTOS时，对它提供的工作机制表示非常不解：</p>
<blockquote>
<p>明明单片机里只有一个CPU核心，为什么能同时运行好几个任务？</p>
</blockquote>
<p>直到后来搞清楚了背后的原理，才发现原来其实很简单：它通过某种技巧，让我们误以为系统里的任务都能同时运行。</p>
<p>在今天这篇文章中，我们就来好好聊一聊，RTOS到底是怎么让多个任务看起来同时运行的？</p>
<h2 id="生活中的类比" tabindex="-1"><a class="header-anchor" href="#生活中的类比"><span>生活中的类比</span></a></h2>
<p>首先，让我们来看一个生活中的例子。</p>
<p>假设你去一家餐馆吃饭，并且和另外两桌客人几乎同时点了菜，分别是：红烧肉、清蒸鱼和炒青菜。</p>
<p>当菜单送到厨房后，厨房开始炒菜。此时，你和其他客户并不知道里面到底有几个厨师在炒菜。</p>
<p>如果厨房里只有一个厨师，他该怎么办呢？如果一道菜一道菜炒，可能会导致有的客户等待时间太长而走人。</p>
<p>虽然他不可能同时炒三个菜，但他可以快速切换：炒一会儿红烧肉，然后去看看清蒸鱼蒸得怎么样，再去扒拉两下炒青菜，然后回来继续炒红烧肉。
<img src="@source/notes/tech/rtos100/schedule/images/q49/餐馆厨师轮流炒菜类比图.jpg" alt="餐馆厨师轮流炒菜类比图"></p>
<p>对于外面的客人来说，下单之后菜就在做了，感觉就像是有专门的厨师在做自己的那道菜。<strong>但实际上，从头到尾只有一个厨师在轮流炒不同的菜。</strong></p>
<p>也就是说：<strong>只要厨师的动作足够快，这三道菜就似乎同时在炒。</strong></p>
<h2 id="rtos是怎么切换的" tabindex="-1"><a class="header-anchor" href="#rtos是怎么切换的"><span>RTOS是怎么切换的</span></a></h2>
<p>RTOS中的多任务运行也是类似的道理：只要让CPU快速地、轮流在不同任务上执行，这些任务似乎都在同时执行。</p>
<p>这里，我们用三个任务来模拟餐馆厨房的场景：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* Task0：红烧肉任务 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> task0</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">parameter</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    {</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        printf</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">"</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D">炒红烧肉...</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076">\n</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">"</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        rt_thread_mdelay</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">10</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* Task1：清蒸鱼任务 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> task1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">parameter</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    {</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        printf</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">"</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D">蒸清蒸鱼...</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076">\n</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">"</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        rt_thread_mdelay</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">10</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* Task2：炒青菜任务 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> task2</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">parameter</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    {</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        printf</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">"</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D">炒青菜...</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076">\n</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">"</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        rt_thread_mdelay</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">10</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>RTOS会管理所有的任务，决定什么时候运行哪个任务。其中一种简单的做法是：给每个任务分配一定的运行时间，即时间片，当时间片用完之后，切换至另一个任务运行。</p>
<p><img src="https://cdn.nlark.com/yuque/0/2024/jpeg/12764787/1704943605673-0181037b-1987-4ae4-9832-407789e70548.jpeg" alt=""></p>
<p>例如，在上图中，CPU在三个任务之间快速切换，使得这三个任务的执行都能往前推进。</p>
<p>如果每个时间片只有1毫秒，那么在1秒内，CPU可以在三个任务之间来回切换数百次。<strong>对于人来说，根本感觉不到这种切换，只会觉得三个任务都在同时运行</strong>。</p>
<h2 id="并发和并行" tabindex="-1"><a class="header-anchor" href="#并发和并行"><span>并发和并行</span></a></h2>
<p>这里有必要提一下在操作系统相关资料中，经常提及的两个概念：</p>
<ul>
<li><strong>并发</strong>：多个任务在宏观上同时运行，但在微观上是交替执行的。</li>
<li><strong>并行</strong>：多个任务在同一时刻真正同时执行。</li>
</ul>
<p>简单来说：并发是”看起来同时”，并行是”真的同时”。</p>
<p>我们常见的单片机大多数都是单核CPU，所以RTOS只是让多个任务进行并发执行，并不是真正的并行执行。而在多核CPU上，RTOS可以做到让一定数量的任务并行执行，具体数量取决于CPU核心的数量。</p>
<h2 id="付出的代价" tabindex="-1"><a class="header-anchor" href="#付出的代价"><span>付出的代价</span></a></h2>
<p>虽然RTOS能实现任务的”并发”运行，但这要付出额外的代价：
<img src="@source/notes/tech/rtos100/schedule/images/q49/任务切换代价示意图.jpg" alt="任务切换代价示意图"></p>
<p>首先是<strong>性能开销</strong>。RTOS需要实现所谓的上下文切换，这个过程需要消耗一定的CPU时间。虽然单次切换只需要几微秒，但如果任务数量很多、切换很频繁，这个时间就变得不可忽略。</p>
<p>这就像餐馆里的厨师，如果同时做的菜太多，不停地在灶台之间跑来跑去，光跑动的时间就占了很多，真正用来炒菜的时间反而少了。</p>
<p>其次是<strong>资源开销</strong>。RTOS需要为每个任务分配内存空间，用于保存自己的运行状态（当前执行到哪一行代码）、任务控制块等。</p>
<p>这就像厨师需要记住每道菜做到哪一步、有没有放盐。这些都需要厨师花精力去记，记的菜越多，需要的”脑力”就越多。</p>
<h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2>
<p>综上所述，RTOS之所以能够让多个任务看起来同时运行，是因为：</p>
<blockquote>
<p>CPU快速地在不同任务间轮流执行。
只要分配给每个任务的时间足够短、切换速度足够快，人根本感觉不到切换的过程。</p>
</blockquote>
<p>同时，这种机制也是有代价的：既有切换本身的性能开销，也有保存任务状态的资源开销。理解了这些，才能在实际开发中合理地设计任务数量和切换策略。</p>
<hr>
<blockquote>
<p>如果你希望系统地学习RTOS底层原理，可以了解我的《RTOS开发与实战》课程。</p>
<p>课程不是简单地讲解FreeRTOS API的使用，而是带你从零开始编写一个RTOS内核，逐步实现任务管理、任务调度、上下文切换、同步与通信等核心机制，并通过一个远程温湿度监控设备项目，将操作系统原理应用到实际嵌入式开发中。</p>
<p>适合希望深入理解RTOS工作原理、提升嵌入式底层开发能力的同学。</p>
<p><VPLink href="/blog/diyrtos/">课程详情</VPLink></p>
</blockquote>
</div></template>


