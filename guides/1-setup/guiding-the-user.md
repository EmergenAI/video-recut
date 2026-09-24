# Guiding the user through setup

Read this before any moment where the user has to act for the production to continue: connecting
their Bibei account, recharging or waiting out a limit, allowing a one-time installation, choosing
a voice service when the host has none, or approving spending. This page owns how those moments are
spoken. [Services](services.md) and [the machine](machine.md) own the facts behind them.

## Who you are talking to

Assume the user is not a developer. This Skill is installed into many host agents (Doubao, Codex,
Claude and others) by people who want a video, not a toolchain. They may never have opened a
terminal, may not know what an environment variable, a path, a port or an API key is, and cannot
read a stack trace. A setup step they do not understand is a step that does not happen, and the
video they asked for stops there.

## These rules are not optional

- **Always guide.** Whenever the work needs something only the user can do, give them the complete
  guidance for it at that moment. Never replace it with a one-line instruction ("set
  `BIBEI_API_KEY`"), a link alone, or the script's raw output. Never silently skip the capability and
  deliver less without saying so.
- **Plain words.** Say what to click, what to copy, where to paste and what they should see. When a
  technical word cannot be avoided, explain it in the same sentence ("a key, a long password that
  lets this tool use your Bibei account").
- **One step at a time.** Give numbered steps for the current task only, each with its visible
  result ("you will see a page titled 开放平台"). Ask them to reply when done or when something looks
  different, then wait.
- **Do everything you safely can yourself.** Run commands, open pages and files, check results,
  convert files and read logs yourself. Ask the user only for what they alone can do: sign in,
  create or paste a secret, pay or recharge, approve spending, or make a choice.
- **Verify, then say so.** After each user step, check it yourself (for the key: `bibei.mjs key`,
  then `bibei.mjs balance`) and tell them plainly whether it worked and what happens next.
- **Failures in plain words.** Say what went wrong in one sentence, whether any money was charged
  or refunded, and the single next step. Keep codes, request ids and logs in `PROGRESS.md`; show
  them to the user only when they ask or when they must forward them to support.
- **Never abandon the commission.** While a step waits on the user, keep doing the work that does
  not depend on it (reference reading, script, scenes, composition with placeholders), and tell them
  what is already moving.
- **Secrets stay with the user.** You never see, type, store or repeat the key. The routes below are
  built so the user puts it in place themselves. If they paste it into the chat anyway, tell them
  not to, suggest creating a new key and revoking (撤销) the pasted one on the Open Platform page, and do
  not use or repeat the pasted value.
- **Speak the user's language.** The examples below are in Chinese because most users are; adapt
  them to the user's language and to what their host agent can do.

## Connecting the Bibei account

Run `bibei.mjs key` at the start of the work. When no key is configured, guide the user as soon as
the plan needs generated images, video or word timing. Choose the route by what the user can do:

- **Default route, for everyone:** run `bibei.mjs key --open` yourself. It creates the key file and
  opens it in the system text editor (Notepad on Windows, TextEdit on macOS); the user pastes and
  saves. Nothing passes through the chat.
- **The host agent has its own secret or environment settings:** use those when you know exactly
  where they are, and describe that screen instead of the editor.
- **A developer who prefers the terminal:** `bibei.mjs login`.
- **The host runs in a sandbox the user's editor cannot reach:** only the host's own secret settings
  can work; explain that plainly.

Example, adapted to the user's words and host:

> 做视频里的画面需要用你自己的必倍账户来生成，生成时会扣这个账户的积分。我们先把账户连上，大约三分钟，只需要做一次：
>
> 1. 打开 https://www.bibei.cn/app/open-platform ，登录你的必倍账号（没有账号先注册）。登录后也可以从右上角头像菜单里点「开放平台」进入。
> 2. 在「API Key」这一栏点「创建 Key」。
> 3. 名称随便填，比如「做视频」。权限勾选「生图」和「生视频」。「每日积分上限」建议先设 1000，防止意外多花（创建后不能改，想改只能再建一个）。有效天数保持默认就行。
> 4. 用「密码」或「短信」验证一下身份，然后确认。
> 5. 页面会弹出「复制 Key」窗口，里面那一长串字符就是你的密钥，**只显示这一次**。点「复制 Key」。
> 6. 我已经在你电脑上打开了一个空白的记事本窗口。把密钥粘贴进去，按 Ctrl+S 保存，再关掉记事本。最后回到网页点「我已保存」。
>
> 请不要把密钥发到聊天里，它就像你账户的密码。做完后回我一句「好了」，我来检查是否连接成功。

After they reply, run `bibei.mjs key` and `bibei.mjs balance`, then report in their terms: "连接成功，
你的账户现在有 54,883 积分，这个密钥每天最多能用 1,000 积分。" If `key` still finds nothing, the
usual causes are an unsaved file or the token pasted with extra text; ask about those one at a time
and offer to open the file again. Never ask them to show you the file's contents.

When the page reads "管理员尚未开启开放平台的生成能力" or "生图与生视频尚未对外开放", or the 「生图」
「生视频」 permissions cannot be ticked, generation is not open to this account yet. Say so plainly,
and continue with the parts that need no generation.

## Points, recharge and daily limits

Before paid work, state the estimate in points and what it buys, and wait for a clear yes
([Talking about cost](services.md#talking-about-cost)). When the account runs out
(`INSUFFICIENT_POINTS`), say how many points the remaining work needs and that recharging happens on
the Bibei website under 充值 (`/app/recharge`); do not retry. When the key's daily limit is reached
(`TOKEN_DAILY_LIMIT_EXCEEDED`), say that it resets the next day, and what can continue meanwhile. A
key's limit is fixed when it is created; to raise it, the user creates a new key with a higher limit
and saves it the same way (`bibei.mjs key --open` opens the same file; they replace the old key in it),
then revokes the old one on the Open Platform page. Report a failed generation that Bibei refunded as
refunded, so the user knows nothing was lost.

## One-time installation on the machine

When `render.mjs doctor` reports something missing, install or prepare it yourself where you can,
after telling the user in one sentence what it is, why the video needs it, roughly how big it is and
how long it may take ("我需要先装一个视频处理工具 FFmpeg，大约 100 MB，装一次就好"). Ask before large
downloads or installations that change their system. When only the user can install something, give
the exact steps for their operating system with what they will see, and verify afterwards with
`doctor`.

## When the plan cannot be realized as agreed

When a capability fails or a planned element cannot be made (reference images cannot be used, a
shot cannot be generated, no music is available), stop before changing the plan and tell the user
what it changes for the video they will see, and the choices. Example:

> 有个情况需要你决定：现在「带参考图生成视频」用不了，所以每个镜头里的人物可能长得不太一样。你可以选：
>
> 1. 先用现在的方式做，人物前后会有些差别；
> 2. 等这个功能恢复后再做，保证每个镜头都是同一对角色；
> 3. 减少到一个场景，只做一段完整的镜头。
>
> 你想怎么做？

Record what they choose as a deviation in `plan.json` with their words
([the production plan](../2-plan/production-plan.md)). Never make that choice for them to keep the work
moving.

## Music when none is available

When the Treatment has music and no suitable source exists, say so, and offer: a song they send and
may use, a version without music, or generated music where the host offers it. Never use the
reference video's sound instead; it may carry someone else's voice and words that do not match the
new captions, and it may not be licensed.

## Speech when the host has no voice tool

When nothing names a speech service and the host agent offers none, tell the user plainly that the
video has spoken words and this assistant cannot produce a voice by itself, then offer choices in
their terms: record the lines themselves on their phone, use a voice service they already have, or
make a version without speech. Give the steps for whichever they choose.

## Caption precision

When word timing is estimated rather than measured, say what that means for what they will see
("字幕会跟着说话出现，但个别字可能早半拍或晚半拍"), before they rely on it, and offer the simpler caption
style if that matters to them.
