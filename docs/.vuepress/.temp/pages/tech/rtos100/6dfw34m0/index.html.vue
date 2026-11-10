<template><div><p>很多人在用RTOS的消息队列传递数据时，都会有这样的疑问：</p>
<blockquote>
<p>对于几个字节的小消息，比如一个传感器读数，直接把数据发进消息队列完全没问题。
可如果消息很大呢？比如一帧图片有几十KB，一段音频有上百KB。
这时候还能把整个数据发进消息队列吗？有没有什么问题呢？</p>
</blockquote>
<p>在这篇文章中，我就来聊一聊任务之间传递大块消息的正确做法。</p>
<h2 id="直接通过消息队列传递" tabindex="-1"><a class="header-anchor" href="#直接通过消息队列传递"><span>直接通过消息队列传递</span></a></h2>
<p>要理解大块消息传递的问题，首先要明白消息队列的底层实现方式。
<img src="@source/notes/tech/rtos100/ipc/images/q69/消息队列两次拷贝数据示意图.jpg" alt="消息队列两次拷贝数据示意图"></p>
<p>消息队列在发送消息的时候，<strong>并不是把数据的引用传进去，而是把数据完整地拷贝一份，存到队列内部的消息缓冲区里。接收消息的时候，再从缓冲区里把数据拷贝一份出来，交给接收任务</strong>。</p>
<p>也就是说，一条消息从发送到接收，要经历 <strong>“两次拷贝”</strong> ：<font color="#245bdb">发送时从发送方的内存拷贝到队列缓冲区，接收时从队列缓冲区拷贝到接收方的内存</font>。</p>
<p>对于小消息来说，这两次拷贝的开销可以忽略不计。</p>
<blockquote>
<p>但是，如果消息是32KB的图片呢？总共需要拷贝64KB！
这在主频只有几十MHz的MCU上，可能是<strong>无法容忍</strong>的。因为这可能要花掉几毫秒的时间！</p>
</blockquote>
<p>此外，<strong>由于消息队列需要缓存消息，我们将不得不为消息队列缓存区预留较大的内存空间，从而严重占用内存资源</strong>。</p>
<h2 id="解决方案-传递指针而不是数据" tabindex="-1"><a class="header-anchor" href="#解决方案-传递指针而不是数据"><span>解决方案：传递指针而不是数据</span></a></h2>
<p>既然消息过大会导致这些问题，那么我们能不能想办法把消息变小？</p>
<p>举个生活中的例子：</p>
<blockquote>
<p>假设你要给朋友送一个很大的箱子，里面装满了书。
如果直接把这个箱子扛到朋友家里交给他，那又重又费力气，搬一趟可能累得够呛。
但如果你只是给朋友打个电话，告诉他&quot;箱子放在楼下快递柜的第3格，你自己去取&quot;，朋友拿到地址之后自己就能找到箱子。
这样一来，是不是又轻松又高效？</p>
</blockquote>
<p>类似地，我们可以转而采取一种更高效的办法：<font color="#245bdb">不在消息队列中传递数据本身，而是传递指向数据的指针</font>。
<img src="@source/notes/tech/rtos100/ipc/images/q69/消息队列传递指针示意图.jpg" alt="消息队列传递指针示意图"></p>
<p>采用这种方法之后，整个消息传递过程如下：</p>
<ol>
<li>发送方分配一块内存，把大块数据填进去。</li>
<li>发送方把这块内存的指针（4字节）发进消息队列。</li>
<li>接收方从消息队列中取出指针。</li>
<li>接收方通过指针访问数据，进行处理。</li>
<li>接收方处理完之后，再释放这块内存。</li>
</ol>
<p>这样一来，消息队列里传递的只是一个4字节的指针，两次拷贝也就8个字节，开销几乎可以忽略。</p>
<p>消息队列的缓冲区，也只需要考虑缓存的指针数量，不会占用大量的内存。</p>
<h2 id="完整的示例" tabindex="-1"><a class="header-anchor" href="#完整的示例"><span>完整的示例</span></a></h2>
<p>下面这段代码，展示了RT-Thread中，如何用消息队列传递指针的基本过程。</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 消息队列：只传递指针 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">static</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965"> rt_mq_t</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> img_mq</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 图片数据结构体 */</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">typedef</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> struct</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> {</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 略 */</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965"> image_t</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 采集任务 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">static</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> capture_thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">p</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> {</span></span>
<span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965">        image_t</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">img </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_malloc</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">sizeof</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965">image_t</span><span style="--shiki-light:#999999;--shiki-dark:#666666">));</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 填充图片数据 ... */</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 发送指针（只发4字节） */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        rt_mq_send</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">img_mq</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> &#x26;</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">img</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> sizeof</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">img</span><span style="--shiki-light:#999999;--shiki-dark:#666666">));</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        rt_thread_mdelay</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">100</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 处理任务 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">static</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> process_thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">p</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965">    image_t</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">img</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> {</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        rt_mq_recv</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">img_mq</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> &#x26;</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">img</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> sizeof</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">img</span><span style="--shiki-light:#999999;--shiki-dark:#666666">),</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> RT_WAITING_FOREVER</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 处理图片 ... */</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        rt_free</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">img</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在该示例中，采集任务采集了一帧图片，需要传给处理任务进行处理。采集任务并没有将完整的图片数据发进消息队列，而是只发送了指向图片数据的指针；处理任务接收到的也只是一个指针，通过这个指针直接访问图片数据，处理完之后释放内存。</p>
<h2 id="另一种方案-共享内存加信号量" tabindex="-1"><a class="header-anchor" href="#另一种方案-共享内存加信号量"><span>另一种方案：共享内存加信号量</span></a></h2>
<p>在某些情况下，消息比较大且可以采用共享内存的方式时，可以使用另一种方案：共享内存+信号量同步。</p>
<p>这种方案的做法是：</p>
<blockquote>
<p>预先分配一块共享内存，发送方和接收方都可以访问。
发送方往共享内存里写数据，写完之后用信号量通知接收方。
接收方收到信号量之后，从共享内存里读数据，处理完之后再用信号量通知发送方可以继续写。
<img src="@source/notes/tech/rtos100/ipc/images/q69/共享内存加信号量收发示意图.jpg" alt="共享内存加信号量收发示意图"></p>
</blockquote>
<p>可以看到，这种方案连指针都不需要传递，完全没有任何拷贝，极大减少了内存占用空间。</p>
<p>不过，这种方式也有一个不足：</p>
<blockquote>
<p>只能一个读一个写，双方必须严格同步，发送方写完之后必须等接收方处理完才能写下一帧。</p>
</blockquote>
<p>下面是一个完整的示例，包含发送方和接收方两个任务函数：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 共享内存和信号量 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">static</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> unsigned</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> char</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> shared_buf</span><span style="--shiki-light:#999999;--shiki-dark:#666666">[</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1024</span><span style="--shiki-light:#999999;--shiki-dark:#666666">];</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">static</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965"> rt_sem_t</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> data_ready</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">   /* 数据就绪通知 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">static</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965"> rt_sem_t</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> done</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">         /* 处理完成通知 */</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 发送方任务 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">static</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> sender_thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">p</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> {</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 等待接收方处理完成，才能写下一帧 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        rt_sem_take</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">done</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> RT_WAITING_FOREVER</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 往共享内存写数据 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        write_data</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">shared_buf</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 通知接收方：数据准备好了 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        rt_sem_release</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">data_ready</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">/* 接收方任务 */</span></span>
<span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">static</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> receiver_thread</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">p</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#1E754F;--shiki-dark:#4D9375">    while</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91">1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> {</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 等待发送方数据准备好 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        rt_sem_take</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">data_ready</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> RT_WAITING_FOREVER</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 从共享内存读数据并处理 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        read_and_process</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">shared_buf</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">        /* 通知发送方：处理完成，可以写下一帧 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">        rt_sem_release</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">done</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">    }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>需要注意的是：</p>
<blockquote>
<p>done信号量的初始值应该设为1，这样发送方一开始就能往共享内存写数据；
data_ready信号量的初始值设为0，等待发送方释放。</p>
</blockquote>
<p>针对上述代码，其工作流程如下所示：
<img src="@source/notes/tech/rtos100/ipc/images/q69/共享内存双信号量交接时序图.jpg" alt="共享内存双信号量交接时序图"></p>
<p>首先，发送方先等待done信号量，获得后往共享内存写数据，然后释放data_ready信号量通知接收方；</p>
<p>此时，接收方在等待data_ready信号量，获得后从共享内存读数据并处理，处理完释放done信号量通知发送方可以写下一帧。</p>
<p>如此一来，两个信号量像接力棒一样在两个任务之间传递，保证了共享内存的读写不会冲突。</p>
<h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2>
<p>综上所述，我们看到任务之间传递消息的三种方式：</p>
<ol>
<li><strong>按值拷贝</strong>：适合小消息，简单直接，但大块数据的两次拷贝开销很大。</li>
<li><strong>传递指针</strong>：适合大块消息，消息队列只传递4字节指针，数据本身零拷贝。</li>
<li><strong>共享内存加信号量</strong>：适合超大块或高频发送，完全零拷贝，内存反复使用。</li>
</ol>
<p>通过对比可知：传递大块消息时，应当采用传递指针或者共享内存的方式，从而大幅降低拷贝开销，提升系统的运行效率。</p>
<hr>
<blockquote>
<p>如果你希望系统地学习RTOS底层原理，可以了解我的《RTOS开发与实战》课程。</p>
<p>课程不是简单地讲解FreeRTOS API的使用，而是带你从零开始编写一个RTOS内核，逐步实现任务管理、任务调度、上下文切换、同步与通信等核心机制，并通过一个远程温湿度监控设备项目，将操作系统原理应用到实际嵌入式开发中。</p>
<p>适合希望深入理解RTOS工作原理、提升嵌入式底层开发能力的同学。</p>
<p><VPLink href="/blog/diyrtos/">课程详情</VPLink></p>
</blockquote>
</div></template>


