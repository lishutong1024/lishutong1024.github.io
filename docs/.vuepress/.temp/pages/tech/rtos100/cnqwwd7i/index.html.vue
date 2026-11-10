<template><div><p>在初学RTOS的时候，你可能会注意到一个现象：</p>
<blockquote>
<p>不管是FreeRTOS、RT-Thread还是μC/OS，几乎所有的例程里，任务函数的实现都类似，即使用了一个while(1)的无限循环。</p>
</blockquote>
<p>比如，在RT-Thread里，最常见的任务写法如下：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">static</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> sensor_thread_entry</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">parameter</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    {</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        read_temp_humi</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        rt_thread_mdelay</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1000</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>于是，不少人心里就会冒出一个疑问：<font color="#245bdb">任务函数是不是必须写成无限循环？能不能使用return？</font></p>
<p>在这篇文章中，将解答这些疑问。</p>
<h2 id="一、为什么通常写成无限循环" tabindex="-1"><a class="header-anchor" href="#一、为什么通常写成无限循环"><span>一、为什么通常写成无限循环</span></a></h2>
<p>为什么任务函数通常写成无限循环？要回答这个问题，我们得先想一想任务到底是用来干什么的。</p>
<p><strong>在嵌入式系统里，大多数任务承担的都是某种长期运行的服务</strong>，比如每隔一秒采集一次温湿度数据、或者一直在后台监听有没有网络数据要上传。我们会发现：这些任务有一个共同特点，那<strong>就是它们需要设备在整个运行期间持续不断地工作，而不是做一次就结束。</strong></p>
<p>这里仍然以温湿度监控设备为例说明。</p>
<p>比如，传感器采集任务的职责是周期性地读取传感器数据。如果这个任务只检测一次就return了，那么系统跑完这一次采集之后，就再也不会去读传感器了。此时，设备也就失去了监控的意义。</p>
<font color="#245bdb">也就是说，对于这类任务来说，将它写成无限循环是最合理的选择。</font><p>不过，有人可能会担心使用无限循环，会导致任务长期占用CPU，别的任务就无法运行。其实，这种担心是多余的。</p>
<p>在这些任务中，通常使用信号量等待、任务延时等接口，让任务在不需要工作的时候主动让出CPU，从而避免CPU空转浪费资源。此时，RTOS会将任务的TCB从就绪队列中，放入阻塞或延时队列，直至需要工作时再放回原来的就绪队列。
<img src="@source/notes/tech/rtos100/task/images/q12/任务运行等待循环流程图.jpg" alt="任务运行等待循环流程图"></p>
<p>由此可见，<font color="#245bdb">无限循环加上阻塞延时，任务的执行实际上是&quot;运行-&gt;等待-&gt;再运行。。。&quot;这种模式。这正是长期服务型任务最典型的运行模式。</font></p>
<h2 id="二、任务其实可以执行完就销毁" tabindex="-1"><a class="header-anchor" href="#二、任务其实可以执行完就销毁"><span>二、任务其实可以执行完就销毁</span></a></h2>
<p>不过，无限循环并不是任务的唯一写法。在有些情况下，也可以在任务中使用return，很多RTOS本身也并不禁止使用return。</p>
<p>事实上，<font color="#245bdb">很多RTOS都支持&quot;按需创建任务、工作完就销毁&quot;的模式。</font>（注意，有些RTOS并不一定支持，请查看其使用手册）</p>
<p>例如，在系统启动时，需要做一些一次性的初始化工作，如读取配置参数、检查硬件版本。这些事情做完一次就不需要再做了，完全可以写成一个普通函数，执行完就return。</p>
<p>我们也可以创建一个动态任务来进行初始化，初始化结束后再主动退出。以RT-Thread为例，示例代码如下：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">static</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> init_thread_entry</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">parameter</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    sensor_calibrate</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    load_config</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    check_hw_version</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 执行完直接 return，任务自动结束 */</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">int</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> main</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965">    rt_thread_t</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> tid</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">    tid </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_thread_create</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">"</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D">init</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77">"</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> init_thread_entry</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">                           RT_NULL</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 512</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 5</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 10</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_thread_startup</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">tid</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    return</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 0</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当init_thread_entry执行到函数末尾的时候，RT-Thread的内核会检测到init任务已经执行完毕结束。</p>
<p>此时，内核将自动把任务的TCB从调度队列中移除，并回收对应的栈空间和TCB等资源。整个过程不需要我们手动调用删除接口，内核会帮我们处理好。</p>
<h2 id="三、按需创建销毁的代价" tabindex="-1"><a class="header-anchor" href="#三、按需创建销毁的代价"><span>三、按需创建销毁的代价</span></a></h2>
<p>既然按需创建任务这么方便，并且能及时回收相应的资源，那为什么不把所有任务都写成这样呢？主要原因在于：</p>
<p>1.首先，<font color="#245bdb">频繁地创建和销毁任务是有代价的</font>。当每次创建任务时，内核都要为它分配栈空间、初始化任务控制块、将TCB插入就绪队列。而销毁的时候，又要把这些资源释放掉、从各种内核链表中移除。</p>
<p>如果频繁地执行这种操作，系统调度和内存管理的开销将会明显增加，实时性也会受到影响。</p>
<p>2.其次，<font color="#245bdb">可能会出现创建失败的情况。</font>例如，当任务是用rt_thread_create()等接口从堆中动态创建时，这就意味着每次创建都要向堆申请内存。</p>
<p>在嵌入式设备上，堆空间通常比较有限，频繁地申请和释放不同大小的内存，也很容易产生内存碎片。综合这些因素，导致有可能产生内存不够分配失败的情况，此时任务将无法创建。</p>
<p>所以，在实际工作中，我们往往<font color="#245bdb">会把长期运行的服务类任务写成无限循环，在系统启动时创建并一直运行。对于那些确实只需要执行一次的初始化工作、或者偶尔才触发一次的短时操作，也会尽可能采用其它方式来实现，避免采用按需动态创建任务</font>。</p>
<h2 id="四、总结" tabindex="-1"><a class="header-anchor" href="#四、总结"><span>四、总结</span></a></h2>
<p>综上所述，任务函数并不是必须写成无限循环，很多RTOS支持任务执行完后return。</p>
<p>在绝大多数嵌入式场景下，任务需要持续运行，写成无限循环加阻塞延时是最合理、最高效的选择。&quot;按需创建任务、工作完销毁&quot;的模式虽然灵活，但会带来调度和内存分配的开销及相关风险，实际比较少用这种方式。</p>
<hr>
<blockquote>
<p>如果你希望系统地学习RTOS底层原理，可以了解我的《RTOS开发与实战》课程。</p>
<p>课程不是简单地讲解FreeRTOS API的使用，而是带你从零开始编写一个RTOS内核，逐步实现任务管理、任务调度、上下文切换、同步与通信等核心机制，并通过一个远程温湿度监控设备项目，将操作系统原理应用到实际嵌入式开发中。</p>
<p>适合希望深入理解RTOS工作原理、提升嵌入式底层开发能力的同学。</p>
<p><VPLink href="/blog/diyrtos/">课程详情</VPLink></p>
</blockquote>
</div></template>


