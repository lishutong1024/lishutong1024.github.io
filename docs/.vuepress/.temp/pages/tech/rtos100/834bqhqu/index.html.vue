<template><div><p>在RTOS中，为了保护临界区代码不被多个任务或者中断同时访问，系统通常提供了三种保护方案：关中断、调度锁和互斥锁。</p>
<p>很多同学刚开始接触的时候，对这三种方式的区别不太清楚，经常随便乱用。结果要么影响了中断的响应，要么降低了系统的实时性。</p>
<p>那么，这三种方式到底有什么区别？分别适合什么场景呢？</p>
<h2 id="关中断" tabindex="-1"><a class="header-anchor" href="#关中断"><span>关中断</span></a></h2>
<p>关中断是保护力度最强的一种方式。</p>
<p>调用关中断函数之后，CPU不会响应任何外部中断。<strong>由于RTOS的任务调度通常是在中断中触发（如Cortex-M的PendSV），再加上任务不主动进行切换，所以关中断之后既不会有中断响应，也不会有任务切换，当前任务会一直运行到重新打开中断。</strong></p>
<p><img src="@source/notes/tech/rtos100/irq/images/q91/关中断执行流程图.jpg" alt="关中断执行流程图"></p>
<p>下面给出了一个关中断的示例代码（以RT-Thread为例）：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> write_buffer</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">uint8_t</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> data</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 关中断，保存当前中断状态 */</span></span>
<span class="line"><span style="--shiki-light:#998418;--shiki-dark:#B8A965">    rt_base_t</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> level </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> rt_hw_interrupt_disable</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 临界区：往环形缓冲区写数据 */</span></span>
<span class="line"><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">    buffer</span><span style="--shiki-light:#999999;--shiki-dark:#666666">[</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">write_pos</span><span style="--shiki-light:#999999;--shiki-dark:#666666">]</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> =</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> data</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">    write_pos </span><span style="--shiki-light:#999999;--shiki-dark:#666666">=</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> (</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">write_pos </span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">+</span><span style="--shiki-light:#2F798A;--shiki-dark:#4C9A91"> 1</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> %</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> BUFFER_SIZE</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 恢复中断状态 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_hw_interrupt_enable</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">level</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上述代码中，在往环形缓冲区写数据之前，先关中断、写完之后恢复，从而保证写缓冲区的过程不会被打断，防止读写指针错乱。</p>
<p><strong>关中断的优点：简单直接，保护力度最强，任务和中断上下文都能用；缺点：关中断期间所有中断都得不到响应，时间太长会严重影响实时性甚至丢失中断</strong>。</p>
<p>所以，<strong>关中断适合用在中断上下文，或者任务上下文中极短的临界区</strong>，比如修改单个变量。</p>
<h2 id="调度锁" tabindex="-1"><a class="header-anchor" href="#调度锁"><span>调度锁</span></a></h2>
<p>相比关中断，调度锁的保护力度要弱一些。</p>
<p><strong>进入调度锁之后，调度器被锁定，不会发生任务切换，但中断仍然可以正常响应</strong>。当中断服务程序返回时，不会触发调度，而是回到原来的任务继续执行，直到退出调度锁后，调度器才重新检查是否需要切换任务。</p>
<p><img src="@source/notes/tech/rtos100/irq/images/q91/调度锁执行流程图.jpg" alt="调度锁执行流程图"></p>
<p>下面给出使用调度锁的示例代码：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> add_node</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965">list_node_t</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> *</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">node</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 进入调度锁 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_enter_critical</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 临界区：往全局链表插入节点 */</span></span>
<span class="line"><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">    node</span><span style="--shiki-light:#999999;--shiki-dark:#666666">-></span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">next</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> =</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> global_list</span><span style="--shiki-light:#999999;--shiki-dark:#666666">.</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">next</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">    global_list</span><span style="--shiki-light:#999999;--shiki-dark:#666666">.</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A">next</span><span style="--shiki-light:#999999;--shiki-dark:#666666"> =</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> node</span><span style="--shiki-light:#999999;--shiki-dark:#666666">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 退出调度锁 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_exit_critical</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在这段代码中，往全局链表插入节点前后加了调度锁，保证插入操作不会被其他任务打断，防止链表结构被破坏，同时中断仍然可以正常响应。</p>
<p><strong>调度锁的优点：中断能及时响应，不影响中断实时性；缺点：只能在任务上下文使用，临界区太长的话高优先级任务还是得不到运行</strong>。所以，<strong>这种方式适合：任务上下文中中等长度的临界区</strong>，比如链表操作、队列操作、修改几个全局变量。</p>
<h2 id="互斥锁" tabindex="-1"><a class="header-anchor" href="#互斥锁"><span>互斥锁</span></a></h2>
<p>互斥锁的保护力度最弱但最灵活。</p>
<p>互斥锁本质上是一种特殊的信号量，获取不到时任务会阻塞等待，直到持有锁的任务释放后才被唤醒。<strong>互斥锁不会禁止中断和调度，只是让竞争同一资源的任务阻塞，其他任务和中断都不受影响</strong>。
<img src="@source/notes/tech/rtos100/irq/images/q91/互斥锁执行流程图.jpg" alt="互斥锁执行流程图"></p>
<p>另外，互斥锁支持优先级继承，高优先级任务等待低优先级任务持有的锁时，可以临时提升低优先级任务的优先级，防止优先级反转。</p>
<p>下面给出了互斥锁的示例代码：</p>
<div class="language-c line-numbers-mode" data-highlighter="shiki" data-ext="c" style="--shiki-light:#393a34;--shiki-dark:#dbd7caee;--shiki-light-bg:#ffffff;--shiki-dark-bg:#121212"><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" v-pre=""><code class="language-c"><span class="line"><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">void</span><span style="--shiki-light:#59873A;--shiki-dark:#80A665"> spi_write_register</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676">uint8_t</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> reg</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#AB5959;--shiki-dark:#CB7676"> uint8_t</span><span style="--shiki-light:#B07D48;--shiki-dark:#BD976A"> value</span><span style="--shiki-light:#999999;--shiki-dark:#666666">)</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">{</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 获取互斥锁，获取不到则阻塞等待 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_mutex_take</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">spi_mutex</span><span style="--shiki-light:#999999;--shiki-dark:#666666">,</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE"> RT_WAITING_FOREVER</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 临界区：通过SPI接口写寄存器 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    spi_cs_low</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    spi_send_byte</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">reg</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    spi_send_byte</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">value</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    spi_cs_high</span><span style="--shiki-light:#999999;--shiki-dark:#666666">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD">    /* 释放互斥锁 */</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665">    rt_mutex_release</span><span style="--shiki-light:#999999;--shiki-dark:#666666">(</span><span style="--shiki-light:#393A34;--shiki-dark:#DBD7CAEE">spi_mutex</span><span style="--shiki-light:#999999;--shiki-dark:#666666">);</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666">}</span></span></code></pre>
<div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在这段代码中，使用了互斥锁保护SPI总线，当多个任务同时调用该函数时，获取不到锁的任务会阻塞等待，从而保证两个任务的SPI操作不会交错在一起导致通信出错。</p>
<p><strong>互斥锁的优点：影响范围最小，只阻塞竞争同一资源的任务，支持阻塞等待和优先级继承；缺点：只能在任务上下文使用，实现相对复杂，有一定系统开销。</strong></p>
<p>所以，<strong>互斥锁适合任务上下文中较长的临界区</strong>，比如访问共享外设、操作复杂数据结构、需要阻塞等待的场景。</p>
<h2 id="三种方式对比" tabindex="-1"><a class="header-anchor" href="#三种方式对比"><span>三种方式对比</span></a></h2>
<p>下面我们将这三种方式的特点整理成下图，以方便大家更直观地理解它们的区别。</p>
<p><img src="@source/notes/tech/rtos100/irq/images/q91/三种保护方式对比图.jpg" alt="三种保护方式对比图"></p>
<p>从对比中可以看到，<strong>关中断的影响范围最大，连中断都不响应，但可以用在中断上下文里；调度锁的影响范围中等，中断能响应但任务不调度，只能用在任务上下文；互斥锁的影响范围最小，只阻塞竞争资源的任务，只能用在任务上下文。</strong></p>
<h2 id="如何选择" tabindex="-1"><a class="header-anchor" href="#如何选择"><span>如何选择</span></a></h2>
<p>在实际开发中，我们可以按照下面的流程来判断使用哪一种机制。</p>
<p><img src="@source/notes/tech/rtos100/irq/images/q91/保护方式选择流程图.jpg" alt="保护方式选择流程图"></p>
<p>首先，看是不是在中断上下文里，如果是，那就只能用关中断，因为调度锁和互斥锁都不能在中断里使用。</p>
<p>其次，再看临界区是不是很短，如果只是几条指令的操作，比如修改几个变量，那么关中断或者调度锁都可以，关中断更简单直接。</p>
<p>最后，如果临界区比较长，再看是否需要阻塞等待，如果需要等待资源可用，那就用互斥锁；如果不需要阻塞，只是简单保护一下，那就用调度锁。</p>
<p>当然，以上只是建议，在实际项目中应该根据需求特点灵活选择。</p>
<h2 id="总结" tabindex="-1"><a class="header-anchor" href="#总结"><span>总结</span></a></h2>
<p>综上所述，关中断、调度锁和互斥锁的核心区别在于对系统的影响范围不同。</p>
<p>关中断影响最大，连中断都不响应，适合中断上下文和极短临界区；调度锁影响中等，中断能响应但不调度，适合任务上下文里中等长度的临界区；互斥锁影响最小，只阻塞竞争任务，适合任务上下文里较长的共享资源访问。</p>
<p>在实际开发中，应根据临界区长度、使用上下文和是否需要阻塞等待来选择合适的方式。</p>
<hr>
<blockquote>
<p>如果你希望系统地学习RTOS底层原理，可以了解我的《RTOS开发与实战》课程。</p>
<p>课程不是简单地讲解FreeRTOS API的使用，而是带你从零开始编写一个RTOS内核，逐步实现任务管理、任务调度、上下文切换、同步与通信等核心机制，并通过一个远程温湿度监控设备项目，将操作系统原理应用到实际嵌入式开发中。</p>
<p>适合希望深入理解RTOS工作原理、提升嵌入式底层开发能力的同学。</p>
<p><VPLink href="/blog/diyrtos/">课程详情</VPLink></p>
</blockquote>
</div></template>


