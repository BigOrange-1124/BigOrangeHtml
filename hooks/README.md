# 邮件自动发送工具

一个功能强大、简单易用的 Python 邮件发送工具。

## ✨ 特性

- ✅ 支持多种邮件服务商（163、QQ、Gmail、Outlook等）
- ✅ 纯文本和 HTML 格式邮件
- ✅ 支持多个收件人、抄送、密送
- ✅ 支持附件
- ✅ 预设配置，开箱即用
- ✅ 完善的错误处理
- ✅ 命令行接口

## 📦 文件说明

```
hooks/
├── email_sender.py      # 主程序（邮件发送类）
├── email_examples.py    # 使用示例（10个场景）
└── README.md           # 本文档
```

## 🚀 快速开始

### 1. 安装依赖

本脚本只使用 Python 标准库，无需安装额外依赖：

```bash
# 确认 Python 版本（需要 3.6+）
python --version

# 无需安装任何包，直接使用即可
```

### 2. 最简单的用法

```python
from email_sender import quick_send

quick_send(
    provider='163',                    # 邮件服务商
    from_email='***@163.com',          # 你的邮箱
    password='***',                     # 授权码（不是登录密码）
    to_emails='recipient@example.com',  # 收件人
    subject='测试邮件',
    body='这是一封测试邮件。'
)
```

### 3. 运行示例

```bash
# 查看所有示例
python email_examples.py

# 运行特定示例
python email_examples.py 1    # 最简单的用法
python email_examples.py 3    # HTML邮件
python email_examples.py 5    # 带附件的邮件

# 查看支持的邮件服务商
python email_examples.py providers
```

## 📚 详细用法

### 方式一：Python 代码

#### 基础用法

```python
from email_sender import EmailSender

# 使用预设配置（推荐）
sender = EmailSender.from_preset(
    provider='163',
    from_email='your-email@163.com',
    password='your-auth-code'
)

# 发送邮件
sender.send(
    to_emails='recipient@example.com',
    subject='邮件主题',
    body='邮件正文内容'
)
```

#### HTML 邮件

```python
html_content = """
<html>
<body>
    <h2>欢迎</h2>
    <p>这是一封 <strong>HTML</strong> 邮件。</p>
</body>
</html>
"""

sender.send(
    to_emails='user@example.com',
    subject='HTML邮件',
    body=html_content,
    html=True
)
```

#### 多收件人

```python
sender.send(
    to_emails=['user1@example.com', 'user2@example.com'],
    subject='群发邮件',
    body='发送给多个人',
    cc_emails=['cc@example.com'],      # 抄送
    bcc_emails=['bcc@example.com']     # 密送
)
```

#### 带附件

```python
sender.send(
    to_emails='user@example.com',
    subject='带附件的邮件',
    body='请查收附件',
    attachments=[
        'document.pdf',
        'data.xlsx',
        'image.png'
    ]
)
```

#### 完整功能

```python
sender.send(
    to_emails=['user1@example.com', 'user2@example.com'],
    subject='完整功能演示',
    body='<h2>HTML内容</h2>',
    html=True,
    cc_emails='cc@example.com',
    bcc_emails='bcc@example.com',
    attachments=['report.pdf'],
    reply_to='support@example.com',
    from_name='发件人名称'
)
```

### 方式二：命令行

```bash
# 基础用法
python email_sender.py \
  --provider 163 \
  --from your-email@163.com \
  --password your-auth-code \
  --to recipient@example.com \
  --subject "测试邮件" \
  --body "邮件正文"

# HTML邮件
python email_sender.py \
  --provider 163 \
  --from your-email@163.com \
  --password your-auth-code \
  --to recipient@example.com \
  --subject "HTML邮件" \
  --body "<h1>标题</h1>" \
  --html

# 多收件人 + 抄送 + 附件
python email_sender.py \
  --provider 163 \
  --from your-email@163.com \
  --password your-auth-code \
  --to user1@example.com,user2@example.com \
  --cc cc@example.com \
  --bcc bcc@example.com \
  --subject "群发邮件" \
  --body "请查收" \
  --attach file1.pdf \
  --attach file2.xlsx

# 从文件读取内容
python email_sender.py \
  --provider 163 \
  --from your-email@163.com \
  --password your-auth-code \
  --to recipient@example.com \
  --subject "邮件主题" \
  --body "$(cat email_content.txt)"

# 从标准输入读取
echo "邮件正文" | python email_sender.py \
  --provider 163 \
  --from your-email@163.com \
  --password your-auth-code \
  --to recipient@example.com \
  --subject "测试"
```

## 🌐 支持的邮件服务商

| 服务商 | Provider 参数 | SMTP 服务器 | 端口 |
|--------|--------------|-----------|------|
| 163 邮箱 | `163` | smtp.163.com | 465 |
| QQ 邮箱 | `qq` | smtp.qq.com | 465 |
| Gmail | `gmail` | smtp.gmail.com | 465 |
| Outlook | `outlook` | smtp-mail.outlook.com | 587 |
| 126 邮箱 | `126` | smtp.126.com | 465 |
| 新浪邮箱 | `sina` | smtp.sina.com | 465 |

### 自定义 SMTP 服务器

```python
sender = EmailSender(
    smtp_server='smtp.company.com',    # 企业SMTP服务器
    smtp_port=587,
    from_email='noreply@company.com',
    password='password',
    use_ssl=False,
    use_tls=True
)
```

## 🔑 获取授权码

### 163 邮箱
1. 登录 163 邮箱网页版
2. 设置 → POP3/SMTP/IMAP
3. 开启"POP3/SMTP"服务
4. 点击"客户端授权密码"，获取授权码

### QQ 邮箱
1. 登录 QQ 邮箱网页版
2. 设置 → 账户
3. 开启"POP3/SMTP"服务
4. 生成授权码

### Gmail
1. 登录 Google 账户
2. 安全性 → 两步验证
3. 应用密码 → 生成新密码

## 📖 API 参考

### EmailSender 类

#### 初始化方法

```python
EmailSender(
    smtp_server: str,      # SMTP服务器地址
    smtp_port: int,        # SMTP端口
    from_email: str,       # 发件人邮箱
    password: str,         # 密码或授权码
    use_ssl: bool = True,  # 是否使用SSL
    use_tls: bool = False  # 是否使用TLS
)
```

#### 类方法

```python
EmailSender.from_preset(
    provider: str,         # 邮件服务商名称
    from_email: str,       # 发件人邮箱
    password: str          # 密码或授权码
) -> EmailSender
```

#### 发送方法

```python
sender.send(
    to_emails: Union[str, List[str]],           # 收件人
    subject: str,                                # 主题
    body: str,                                   # 正文
    html: bool = False,                          # HTML格式
    cc_emails: Optional[Union[str, List[str]]] = None,   # 抄送
    bcc_emails: Optional[Union[str, List[str]]] = None,  # 密送
    attachments: Optional[List[str]] = None,     # 附件
    reply_to: Optional[str] = None,              # 回复地址
    from_name: Optional[str] = None              # 发件人名称
) -> bool
```

## 💡 使用技巧

### 1. 环境变量管理密码

```python
import os
from email_sender import EmailSender

sender = EmailSender.from_preset(
    provider='163',
    from_email=os.environ['EMAIL_FROM'],
    password=os.environ['EMAIL_PASSWORD']
)
```

### 2. 批量发送

```python
recipients = ['user1@example.com', 'user2@example.com']

for email in recipients:
    sender.send(
        to_emails=email,
        subject='个性化邮件',
        body=f'致 {email}'
    )
```

### 3. 邮件模板

```python
def create_email(name, content):
    return f"""
    <html>
    <body>
        <h2>尊敬的 {name}</h2>
        <p>{content}</p>
    </body>
    </html>
    """

sender.send(
    to_emails='user@example.com',
    subject='个性化邮件',
    body=create_email('张三', '欢迎使用我们的服务'),
    html=True
)
```

### 4. 错误处理

```python
try:
    success = sender.send(
        to_emails='user@example.com',
        subject='测试',
        body='内容'
    )

    if not success:
        print("发送失败，正在重试...")
        # 重试逻辑
except Exception as e:
    print(f"发生错误: {e}")
```

## ⚠️ 常见问题

### Q: 发送失败怎么办？
**A:**
1. 确认授权码是否正确（不是登录密码）
2. 检查是否开启了 SMTP 服务
3. 确认网络连接正常
4. 查看防火墙是否阻止了 SMTP 端口

### Q: 如何避免垃圾邮件拦截？
**A:**
1. 使用真实的发件人名称
2. 避免频繁发送
3. 内容不要太简短
4. 添加退订链接

### Q: 附件大小限制？
**A:**
- 大多数邮箱限制为 20-50MB
- 建议单个附件不超过 10MB
- 大文件建议使用云盘链接

## 🔒 安全建议

1. **不要将密码硬编码在代码中**
   - 使用环境变量
   - 使用配置文件（并加入 .gitignore）

2. **定期更换授权码**

3. **使用专用发送邮箱**
   - 不要使用个人主邮箱
   - 创建专门用于程序发送的邮箱

## 📝 更新日志

### v1.0.0 (2026-02-05)
- ✅ 初始版本
- ✅ 支持 6 种邮件服务商
- ✅ 支持文本和 HTML 格式
- ✅ 支持附件
- ✅ 命令行接口

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
