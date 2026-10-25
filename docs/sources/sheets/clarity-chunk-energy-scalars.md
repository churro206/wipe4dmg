# Clarity: Chunk Energy Scalars (blog)

Source: https://www.d2clarity.com/blog/destiny-science-6/chunk-energy-scalars-breakdown-12 (Stardust), retrieved 2026-10-25. Author note: partially outdated, revision planned for July 2026.

Some parts of this blog post are partially outdated and need to be revised. A revision is planned for July of 2026 but until then, take extra care. This post is still a good way to understand what is happening, but you should always reference this spreads​he​​​et for anything specific.

### What are Chunk Energy Scalars?

Chunk Energy Scalars (or the Flat Gain Penalties/Factors as some like to call them) are the result of a system Bungie introduced with the launch of Season of the Wish (Season 23). It's intended to rebalance how much ability energy we gain from perks that instantly give a flat percentage of an ability charge — a chunk of energy if you will.
With this system, the Grenade and Class Abilities with the longest cooldowns only receive 50% of the baseline benefits of the perk. Melee Abilities have a lower ceiling on the penalty so even those with the longest cooldowns receive at least 60% of the perk’s baseline benefits. Super Energy-granting perks are unaffected by the system.
Then, as we go through perks with shorter and shorter cooldowns, the penalty scales down to zero for the abilities with the fastest cooldowns. These will receive the full amount that any given perk grants you.
This blog post was made possible thanks to our wonderful Ko-Fi supp​orters.

### How do Chunk Energy Scalars work?

As expected, this isn’t a simple linear scale or something plain old math will solve for us without much extra effort. Instead, abilities are organized into cooldown tiers where abilities with similar-length cooldowns will share the same scalar.
Thankfully, Engineeeer and RyTako have already done the heavy lifting and tested the penalty for each of the currently available abilities. Below is an example of how these look for each Grenade ability at the time of publishing this blog post. For the latest info, go check out the main spreadsheet!
The values in the first column indicate the percentage of the original energy amount you will receive from affected perks. Going forward, we'll be using the scalar version of these values which you get by dividing the numbers by 100. (e.g.: 87.5% → 0.875)​
While these Chunk Energy Scalars (CES) do achieve the goal of bringing the actual cooldown time reductions closer for each ability, they also introduce another layer of complexity that makes things harder to understand for everyone involved. This is especially the case with some combinations and abilities remaining seemingly unaffected by the system. With that said, let’s go over how all of this works by using the Demolitionist weapon perk as an example.
On a Shotgun, Demolitionist grants you 20% Grenade Energy with each kill you score with the weapon. However, how much energy you actually get out of it will vary significantly depending on the Grenade ability you have equipped.

##### Vortex Grenade | High Penalty

Vortex Grenade for example has a base (Tier 3) cooldown of 152 seconds which lands them in the most penalized tier of Grenade Abilities with a 0.5x CES. So instead of the 20% the perk should give you, you’ll only receive half of that.
At Tier 3 Discipline (152s cooldown), this would mean that Demolitionist only cuts 15.2 seconds off of your cooldown instead of 30.4. At Tier 10 (76s cooldown), the numbers would be 15.2 seconds without the effects of CES and only 7.6 seconds with.

##### Healing Grenade | Low Penalty

Healing Grenade is in a better spot as its base cooldown of 91 seconds lands it near the top of the pack with a 0.875x CES — the second-highest value available. This means you’ll only be giving up 12.5% of the energy the perk would otherwise give you.
Looking at the numbers at Tier 3 Discipline (91s cooldown), Demolitionist would save 18.2 seconds without the effects of CES and a still respectable 15.925 seconds with. At Tier 10 (45.5s cooldown), these numbers would be halved: 9.1 seconds without CES and 7.9625 seconds with.

##### Summary

As you can see from these two examples, the time the perk cuts off your overall cooldown is similar in both cases — hovering at 15-16 seconds at Tier 3 Discipline and 7.5-8 seconds at Tier 10. This property of the system can be used to gain a bit of intuition for how much time a perk will cut off your cooldowns. However, don’t expect it to be anything reliable — at most a general outline for your build crafting thought process.

### Class Item Mods and double penalties

As you can see above, Class Item mods (Bomber, Outreach, Distribution) have another layer of penalties applied to them that is in this case inversely tied to the cooldown of the Class Ability you trigger it with ON TOP of the CES penalties of the abilities they are granting energy to. I’m going to call this layer of penalties the CMS, short for Class Mod Scalar.
(While this is not directly relevant to this post as it’s unrelated to Chunk Energy Scalars, for completeness’ sake, CMS also applies to the Super Energy granted by Distribution. But, again, this is because it's separate from the CES system this post covers.)
So let’s say you activate your triple-stacked Bomber mods by casting a Towering Barricade and you’re running an Arcbolt Grenade. First, the CMS gets applied which in this case is 1x (as Barricades are in the lowest CMS penalty tier) and then we apply the CES of the Arcbolt Grenade which is 0.75x.
This leaves us with a total scalar of 0.75x so the 20% Grenade Energy the triple Bomber mods are supposed to grant you will drop to just 15% — or a 7.875-second cooldown reduction at Tier 10 Discipline.
Now let’s take a different example: Marksman’s Dodge combined with a Vortex Grenade. The CMS of Marksman’s Dodge is 0.225x and the CES of Vortex Grenade is 0.5x.
Multiply these together and you get a total scalar of 0.1125x which means that the 20% Grenade Energy triple Bomber mods are supposed to net you drops all the way down to 2.25%. Or in other words, this is a whopping 1.71-second reduction of your 76-second cooldown at Tier 10 Discipline… lol; lmao even. Just to remind you, this is with THREE Bomber mods. Talk about a return on investment!
So yeah, those Class Item mods are very much not great in the current sandbox to put it nicely depending on your class ability. Don’t really count on them to be significant parts of your build and just leave them for last in case you still have one or two empty mod sockets on your class items.

### Intended exceptions: Ability-Specific Perks

While Chunk Energy Scalars are essentially a blanket penalty applied across the entire ability sandbox, some perks are intentionally exempt from the system due to them being inextricably tied to specific abilities. Some examples are Young Ahamkara's Spine being tied to Tripmine Grenades and Omnioculus to Smoke Bombs.
The same goes for perks that refund full ability charges as well. Examples of this include Starfire Protocol for Class Abilities and Apotheosis Veil for all abilities.
And just to reiterate here, perks that don’t just instantly give you a chunk of Ability Energy but instead improve your Ability Recharge Rate are also unaffected by this system.

### Probably unintended exceptions because Destiny 2

At this point, you probably knew that there was still a catch to all this — after all, it wouldn’t be Destiny 2 if there wasn’t at least a bit of jank to be found hehe.
For example, Icefall Mantle and Hoarfrost⁠-⁠Z both set your base cooldown to 70 seconds but are unaffected by CES — retaining the full benefits of Class Ability energy-granting perks.
The other notable example is the Bleak Watcher aspect on Prismatic. As it doesn't override the CES of the abilities and only changes the cooldowns, you'll have a significantly easier time getting your stasis turrets ready if you run Healing Grenades with their 0.875x CES instead of the other grenades that have a CES of 0.625x or lower.
Thankfully, most other known outliers have been fixed since the introduction of the system and these are the only notable examples I'm currently aware of.

### How we’re tackling the issue

While you can probably tell that this is a complex system, we’re taking the necessary first steps to tackling it with this breakdown article and our other resources that I’ll talk more about below. Going forward, our perk tooltips will mention whether the perks are affected by Chunk Energy Scalars and also link to this article so that people will have a way to directly jump to an explanation.
However, there still are issues with this method and that’s unfortunately outside of our control. While we can and regularly do add links to our tooltips, not many sites support them — DIM (albeit difficult to click on them in many cases), Little Light, Blue Engram, and Deepsight being the only ones to do so to my knowledge. So if you’d like to have the convenience of links in other partner apps, you’ll have to ask their respective developers to add support for them.
We also have a separate database for Character Stats that includes all the important information about the stats themselves as well as abilities: their cooldowns at each tier, what their CES is, and a bunch of other things. This database is currently used by DIM and D2ArmorPicker for their cooldown info display but neither app's developers have implemented displaying CES info so we’re stuck where we are on that front. At least until someone can either convince the devs to implement it or do it themselves and submit a pull request.
Hope this was helpful! Until next time, guardian :D

#### Have feedback or questions?

The Clarity Discord server has dedicated forum posts for each blog post we publish! Feel free to join and discuss them or have our blog authors answer any questions you might still have!

#### Written by Stardust

Consider donating to help support high-quality Destiny Science coverage
Support the writer!
- Destiny Science
- Clarity Changelogs
- Weapon Reviews
- Guides
- Home
- Creator Support
- Partnerships
- Destiny Science
- Database Changelogs
- Weapon Reviews
- Guides
