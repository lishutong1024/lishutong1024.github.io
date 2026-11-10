#!/usr/bin/env python3
"""批量在RTOS100问文章末尾追加课程宣传引用段"""
import os
import glob

BASE_DIR = "/Users/lishutong/Documents/site/docs/notes/tech/rtos100"

PROMO = """
---

> 如果你希望系统地学习RTOS底层原理，可以了解我的《RTOS开发与实战》课程。
>
> 课程不是简单地讲解FreeRTOS API的使用，而是带你从零开始编写一个RTOS内核，逐步实现任务管理、任务调度、上下文切换、同步与通信等核心机制，并通过一个远程温湿度监控设备项目，将操作系统原理应用到实际嵌入式开发中。
>
> 适合希望深入理解RTOS工作原理、提升嵌入式底层开发能力的同学。
>
> [课程详情](/courses/core/diyrtos.md)
"""

count = 0
for md_file in glob.glob(os.path.join(BASE_DIR, "*", "q*.md")):
    with open(md_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 检查是否已经加过了
    if "RTOS开发与实战" in content:
        rel = os.path.relpath(md_file, BASE_DIR)
        print(f"SKIP: {rel} (已有宣传段)")
        continue
    
    # 追加到末尾
    new_content = content.rstrip() + "\n" + PROMO
    
    with open(md_file, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    rel = os.path.relpath(md_file, BASE_DIR)
    count += 1
    print(f"OK: {rel}")

print(f"\n=== 完成: 给 {count} 篇文章追加了课程宣传 ===")
