# Play Store listing copy

Paste-ready. Limits: short description **80 characters**, full description
**4000 characters** — both verified below.

Written to describe only what the build actually does. See *What this copy
deliberately leaves out* at the bottom.

---

## Short description (80 max)

```
Online Ludo with friends. Private room codes, CPU rivals, server-rolled dice.
```

---

## Full description (4000 max)

```
Ludo, rebuilt for playing with the people you actually know.

PLAY WITH YOUR SQUAD
Open a private room, share the four-character code, and your friends drop straight in. No friend requests, no usernames to hunt down, no waiting around. One code and you're playing.

OR JUST PLAY, RIGHT NOW
Quick match drops you in with whoever else is online at your stake. Nobody around? CPU rivals take the empty seats after a few seconds, so there is always a game. You never sit on a loading screen hoping someone shows up.

THE DICE AREN'T YOURS TO ROLL
Every roll happens on our server, not on anybody's phone. Your opponent cannot force a six. Neither can you. Every single move is checked by the server before it lands on the board, so a modified app cannot move a token it has no right to move.

That matters most with people you've only just met. Online Ludo lives or dies on whether you believe the dice, and here the dice were never in anyone's hands.

NOBODY GETS TO STALL
Twenty seconds a turn. Run out and the game takes your turn for you and moves on, so one person cannot freeze a match by walking off.

Lose signal in a tunnel or a lift and your seat is held for a minute. A bot covers for you, and the moment you reconnect you drop back into the same seat, same board, same game. Dropped connections lose you a turn, not a match.

THE REAL RULES, PROPERLY DONE
Captures. Blocks. Safe squares. The home column. Three sixes and you forfeit the turn. A six to leave the house and a six to go again. The rules are the ones you grew up arguing about, implemented exactly, with no house-rule surprises halfway through a match.

The board reads at a glance: your movable tokens glow, the turn clock is always visible, and you can see who is connected, who dropped, and who is a bot.

SAY SOMETHING
Emotes mid-match, because winning quietly is not winning.

IN THE BOX
- 2 to 4 players, online
- Private rooms with shareable codes
- Quick match by stake tier
- CPU opponents whenever you want them
- Server-authoritative dice and move validation
- 20-second turn clock
- 60-second reconnection window
- Guest sign-in. No email, no password, no sign-up form

THIS IS A CLOSED TEST
You are playing an early build, and some of what you can see is not finished:

- Avatar creation accepts a photo but currently returns placeholder art. The image pipeline is still being built.
- Leaderboards, the store, friends and progression are visual previews. They show sample data and are not connected to anything yet.
- Accounts are guest accounts tied to your device. We deploy often during testing, which can reset them.

Everything above that line is real and works. If something breaks, we want to hear about it.

YOUR PHOTO, IF YOU USE THE AVATAR SCREEN
Avatar creation is optional and the game is fully playable without it. If you do use it, you are asked for explicit consent first, and your source photo is deleted from our servers as soon as the avatar is generated. We do not use your photo to train anything, and we do not share it. You can delete every avatar, or your whole account, from Settings at any time.
```

---

## What this copy deliberately leaves out

Verified against the code rather than assumed.

### The headline promise is not shippable yet

The project's pitch is *"YOUR FACE. YOUR AVATAR. YOUR SQUAD."* — photos becoming
3D cartoon tokens. The server's wired provider is **`StubAvatarProvider`**, so
avatar generation returns placeholder art, not an avatar of the person.

Advertising it would be the single most prominent claim in the listing and the
first thing every tester would check. It is named only under *This is a closed
test*, as a thing in progress.

**Add this back** as the lead section once a real provider is wired:

> YOUR FACE ON THE BOARD
> Take a photo, pick a style, and your tokens become you. Your squad plays
> against your actual face, not a coloured circle.

### Five screens are sample data

`HomeScreen`, `LeaderboardScreen`, `FriendsScreen`, `StoreScreen`,
`ProfileScreen` and the lobby's seat cards all read from
`src/services/sampleData.js`. A listing promising leaderboards, cosmetics or
clans would describe screens that are visual shells, which testers would find
in under a minute.

### Photo disclosure is still required

Even though avatars are stubbed, the flow **does** upload a photo, so the Data
safety form must declare photo collection regardless of what the description
says. The last paragraph covers it for players; the form is separate and
mandatory.

### Graded content claims

No "best", no "#1", no invented player counts, and no mention of coins or gems
as earnable currency — progression is not wired, and claiming an economy that
does not pay out is the kind of thing that draws a policy flag.
