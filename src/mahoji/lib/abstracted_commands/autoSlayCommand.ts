import { User } from '@prisma/client';
import { KlasaUser } from 'klasa';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';
import { Monsters } from 'oldschooljs';

import { PvMMethod } from '../../../lib/constants';
import killableMonsters from '../../../lib/minions/data/killableMonsters';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import {
	AutoslayOptionsEnum,
	getCommonTaskName,
	getUsersCurrentSlayerInfo,
	SlayerMasterEnum
} from '../../../lib/slayer/slayerUtil';
import { wipeDBArrayByKey } from '../../../lib/util';
import { mahojiUserSettingsUpdate } from '../../mahojiSettings';
import { fightCavesCommand } from './fightCavesCommand';
import { minionKillCommand } from './minionKill';

interface AutoslayLink {
	monsterID: number;
	// Name and Monster must be specified if either is.
	efficientName?: string;
	efficientMonster?: number;
	efficientMethod?: PvMMethod;
	slayerMasters?: SlayerMasterEnum[];
}

const AutoSlayMaxEfficiencyTable: AutoslayLink[] = [
	{
		monsterID: Monsters.Jelly.id,
		efficientName: Monsters.WarpedJelly.name,
		efficientMonster: Monsters.WarpedJelly.id,
		efficientMethod: 'barrage'
	},
	{
		monsterID: Monsters.SpiritualMage.id,
		efficientName: Monsters.SpiritualMage.name,
		efficientMonster: Monsters.SpiritualMage.id,
		efficientMethod: 'none'
	},
	{
		monsterID: Monsters.SpiritualRanger.id,
		efficientName: Monsters.SpiritualMage.name,
		efficientMonster: Monsters.SpiritualMage.id,
		efficientMethod: 'none'
	},
	{
		monsterID: Monsters.KalphiteWorker.id,
		efficientName: Monsters.KalphiteSoldier.name,
		efficientMonster: Monsters.KalphiteSoldier.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.Nechryael.id,
		efficientName: Monsters.GreaterNechryael.name,
		efficientMonster: Monsters.GreaterNechryael.id,
		efficientMethod: 'barrage'
	},
	{
		monsterID: Monsters.BlackDragon.id,
		efficientName: Monsters.BabyBlackDragon.name,
		efficientMonster: Monsters.BabyBlackDragon.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.Bloodveld.id,
		efficientName: Monsters.MutatedBloodveld.name,
		efficientMonster: Monsters.MutatedBloodveld.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.AberrantSpectre.id,
		efficientName: Monsters.AberrantSpectre.name,
		efficientMonster: Monsters.AberrantSpectre.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.MountainTroll.id,
		efficientName: Monsters.MountainTroll.name,
		efficientMonster: Monsters.MountainTroll.id,
		efficientMethod: 'cannon',
		slayerMasters: [SlayerMasterEnum.Konar]
	},
	{
		monsterID: Monsters.MountainTroll.id,
		efficientName: Monsters.IceTroll.name,
		efficientMonster: Monsters.IceTroll.id,
		efficientMethod: 'cannon',
		slayerMasters: [
			SlayerMasterEnum.Chaeldar,
			SlayerMasterEnum.Vannaka,
			SlayerMasterEnum.Nieve,
			SlayerMasterEnum.Duradel
		]
	},
	{
		monsterID: Monsters.Zygomite.id,
		efficientName: Monsters.AncientZygomite.name,
		efficientMonster: Monsters.AncientZygomite.id,
		efficientMethod: 'none'
	},
	{
		monsterID: Monsters.DustDevil.id,
		efficientName: Monsters.DustDevil.name,
		efficientMonster: Monsters.DustDevil.id,
		efficientMethod: 'barrage'
	},
	{
		monsterID: Monsters.Dagannoth.id,
		efficientName: Monsters.Dagannoth.name,
		efficientMonster: Monsters.Dagannoth.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.Hellhound.id,
		efficientName: Monsters.Hellhound.name,
		efficientMonster: Monsters.Hellhound.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.ElfWarrior.id,
		efficientName: Monsters.ElfWarrior.name,
		efficientMonster: Monsters.ElfWarrior.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.Drake.id,
		efficientName: Monsters.Drake.name,
		efficientMonster: Monsters.Drake.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.Suqah.id,
		efficientName: Monsters.Suqah.name,
		efficientMonster: Monsters.Suqah.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.BlackDemon.id,
		efficientName: Monsters.BlackDemon.name,
		efficientMonster: Monsters.BlackDemon.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.GreaterDemon.id,
		efficientName: Monsters.GreaterDemon.name,
		efficientMonster: Monsters.GreaterDemon.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.SmokeDevil.id,
		efficientName: Monsters.SmokeDevil.name,
		efficientMonster: Monsters.SmokeDevil.id,
		efficientMethod: 'barrage'
	},
	{
		monsterID: Monsters.DarkBeast.id,
		efficientName: Monsters.DarkBeast.name,
		efficientMonster: Monsters.DarkBeast.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.SteelDragon.id,
		efficientName: Monsters.SteelDragon.name,
		efficientMonster: Monsters.SteelDragon.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.CaveHorror.id,
		efficientName: Monsters.CaveHorror.name,
		efficientMonster: Monsters.CaveHorror.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.Ankou.id,
		efficientName: Monsters.Ankou.name,
		efficientMonster: Monsters.Ankou.id,
		efficientMethod: 'barrage'
	},
	{
		monsterID: Monsters.BlueDragon.id,
		efficientName: Monsters.BabyBlueDragon.name,
		efficientMonster: Monsters.BabyBlueDragon.id,
		efficientMethod: 'none'
	},
	{
		monsterID: Monsters.FireGiant.id,
		efficientName: Monsters.FireGiant.name,
		efficientMonster: Monsters.FireGiant.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.Hydra.id,
		efficientName: Monsters.Hydra.name,
		efficientMonster: Monsters.Hydra.id,
		efficientMethod: 'cannon'
	},
	{
		monsterID: Monsters.AbyssalDemon.id,
		efficientName: Monsters.AbyssalDemon.name,
		efficientMonster: Monsters.AbyssalDemon.id,
		efficientMethod: 'barrage'
	},
	{
		monsterID: Monsters.Lizardman.id,
		efficientName: Monsters.Lizardman.name,
		efficientMonster: Monsters.Lizardman.id,
		efficientMethod: 'cannon'
	}
];
function determineAutoslayMethod(passedStr: string | undefined, autoslayOptions: AutoslayOptionsEnum[]) {
	const p = passedStr ? passedStr : '';
	let method = 'unknown';
	if (p === 'def' || p === 'default') {
		method = 'default';
	} else if (p === 'boss' || p === 'highest') {
		method = 'boss';
	} else if (p === 'ehp' || p === 'efficient') {
		method = 'ehp';
	} else if (p === 'lowest' || p === 'low') {
		method = 'low';
	} else if (autoslayOptions.includes(AutoslayOptionsEnum.MaxEfficiency)) {
		method = 'ehp';
	} else if (autoslayOptions.includes(AutoslayOptionsEnum.HighestUnlocked)) {
		method = 'boss';
	} else if (autoslayOptions.includes(AutoslayOptionsEnum.LowestCombat)) {
		method = 'low';
	} else if (p === '') {
		method = 'default';
	}
	return method;
}

export async function autoSlayCommand(
	interaction: SlashCommandInteraction,
	channelID: bigint,
	mahojiUser: User,
	user: KlasaUser,
	inputMethod: string
) {
	const autoslayOptions = mahojiUser.slayer_autoslay_options as AutoslayOptionsEnum[];
	// if (_mode === 'check' || msg.flagArgs.check) {
	// 	let autoMsg = '';
	// 	if (autoslayOptions.includes(AutoslayOptionsEnum.HighestUnlocked)) {
	// 		autoMsg = 'You will automatically slay the highest combat level creatures you can.';
	// 	} else if (autoslayOptions.includes(AutoslayOptionsEnum.MaxEfficiency)) {
	// 		autoMsg = 'You will automatically slay the most efficient way.';
	// 	} else if (autoslayOptions.includes(AutoslayOptionsEnum.LowestCombat)) {
	// 		autoMsg = 'You will automatically slay the lowest combat level creature.';
	// 	} else {
	// 		autoMsg = 'You will automatically kill the default slayer creature you can.';
	// 	}
	// 	return autoMsg;
	// }
	const usersTask = await getUsersCurrentSlayerInfo(user.id);
	const isOnTask = usersTask.assignedTask !== null && usersTask.currentTask !== null;

	if (!isOnTask) {
		return "You're not on a slayer task, so you can't autoslay!";
	}
	// Determine method:
	const method = determineAutoslayMethod(inputMethod, autoslayOptions);

	if (method === 'low') {
		// Save as default if user --save's
		// if (msg.flagArgs.save && !autoslayOptions.includes(AutoslayOptionsEnum.LowestCombat)) {
		// 	await wipeDBArrayByKey(user, UserSettings.Slayer.AutoslayOptions);
		// 	await mahojiUserSettingsUpdate(user.id, {
		// 		slayer_autoslay_options: {
		// 			push: AutoslayOptionsEnum.LowestCombat
		// 		}
		// 	});
		// }
		let currentLow = Number.POSITIVE_INFINITY;
		let currentMonID = 0;
		// Iterate through all potentials to get the lowest combatlevel.
		usersTask.assignedTask!.monsters.forEach(m => {
			const osjsM = Monsters.get(m);
			if (osjsM && osjsM.data.combatLevel < currentLow) {
				currentLow = osjsM.data.combatLevel;
				currentMonID = m;
			}
		});
		if (currentMonID === 0) {
			return 'Error: Could not get Monster data to find a task.';
		}

		return minionKillCommand(interaction, user, channelID, Monsters.get(currentMonID)!.name, undefined, undefined);
	}
	if (method === 'ehp') {
		// Save as default if user --save's
		// if (msg.flagArgs.save && !autoslayOptions.includes(AutoslayOptionsEnum.MaxEfficiency)) {
		// 	await wipeDBArrayByKey(user, UserSettings.Slayer.AutoslayOptions);
		// 	await user.settings.update(UserSettings.Slayer.AutoslayOptions, AutoslayOptionsEnum.MaxEfficiency);
		// }
		const ehpMonster = AutoSlayMaxEfficiencyTable.find(e => {
			const masterMatch = !e.slayerMasters || e.slayerMasters.includes(usersTask.currentTask!.slayer_master_id);
			return masterMatch && e.monsterID === usersTask.assignedTask!.monster.id;
		});

		const ehpKillable = killableMonsters.find(m => m.id === ehpMonster?.efficientMonster);

		// If we don't have the requirements for the efficient monster, revert to default monster
		if (ehpKillable?.levelRequirements !== undefined && !user.hasSkillReqs(ehpKillable.levelRequirements)[0]) {
			return minionKillCommand(
				interaction,
				user,
				channelID,
				usersTask.assignedTask!.monster.name,
				undefined,
				undefined
			);
		}

		if (ehpMonster && ehpMonster.efficientName) {
			// if (ehpMonster.efficientMethod) msg.flagArgs[ehpMonster.efficientMethod] = 'force';
			return minionKillCommand(
				interaction,
				user,
				channelID,
				ehpMonster.efficientName,
				undefined,
				ehpMonster.efficientMethod
			);
		}

		return minionKillCommand(
			interaction,
			user,
			channelID,
			usersTask.assignedTask!.monster.name,
			undefined,
			undefined
		);
	}
	if (method === 'boss') {
		// This code handles the 'highest/boss' setting of autoslay.
		const myQPs = await user.settings.get(UserSettings.QP);

		if (msg.flagArgs.save && !autoslayOptions.includes(AutoslayOptionsEnum.HighestUnlocked)) {
			// Save highest as the default if 'highest' is toggled OFF.
			await wipeDBArrayByKey(user, UserSettings.Slayer.AutoslayOptions);
			await user.settings.update(UserSettings.Slayer.AutoslayOptions, AutoslayOptionsEnum.HighestUnlocked);
		}

		let commonName = getCommonTaskName(usersTask.assignedTask!.monster);
		if (commonName === 'TzHaar') {
			return fightCavesCommand(user, channelID);
		}

		const allMonsters = killableMonsters.filter(m => {
			return usersTask.assignedTask!.monsters.includes(m.id);
		});
		if (allMonsters.length === 0) return 'Please report this error. No monster variations found.';
		let maxDiff = 0;
		let maxMobName = '';
		// Use difficultyRating for autoslay highest.
		allMonsters.forEach(m => {
			if (
				(m.difficultyRating ?? 0) > maxDiff &&
				(m.levelRequirements === undefined || user.hasSkillReqs(m.levelRequirements))
			) {
				if (m.qpRequired === undefined || m.qpRequired <= myQPs) {
					maxDiff = m.difficultyRating ?? 0;
					maxMobName = m.name;
				}
			}
		});
		if (maxMobName !== '') {
			return minionKillCommand(interaction, user, channelID, maxMobName, undefined, undefined);
		}
		return "Can't find any monsters you have the requirements to kill!";
	} else if (method === 'default') {
		// This code handles the default option for autoslay:
		if (msg.flagArgs.save && autoslayOptions.length) {
			// Lowest / default = none
			await wipeDBArrayByKey(user, UserSettings.Slayer.AutoslayOptions);
		}
		return minionKillCommand(
			interaction,
			user,
			channelID,
			usersTask.assignedTask!.monster.name,
			undefined,
			undefined
		);
	}
	return `Unrecognized mode. Please use:\n\`${msg.cmdPrefix}as [default|highest|efficient]\``;
}
