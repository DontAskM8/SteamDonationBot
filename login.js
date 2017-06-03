//Required node modules
const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');
const sid = require('steamid');


const client = new SteamUser();
const community = new SteamCommunity();

//Config
const config = require('./config.json')

const logOnOptions = {
	accountName: config.username,
	password: config.password,
	twoFactorCode: SteamTotp.generateAuthCode(config.shared_secret)
};

client.logOn(logOnOptions);

client.on('loggedOn', () => {
	console.log('Logged into Steam');
	
	client.setPersona(SteamUser.Steam.EPersonaState.Online);
	client.gamesPlayed(config.idle);
	
	console.log('Started idling game with the code ' + config.idle)
});

const manager = new TradeOfferManager({
	steam: client,
	community: community,
	language: 'en',
});

client.on('webSession', (sessionid, cookies) => {
	manager.setCookies(cookies);

	community.setCookies(cookies);
	community.startConfirmationChecker(10000, config.identity_secret);
});

manager.on('newOffer', (offer) => {
	if (offer.itemsToGive.length === 0) {
		offer.accept((err, status) => {
			if (err) {
				console.log(err);
			} else {
				console.log(`Donation accepted. Status: ${status}.`);
				community.postUserComment(offer.partner.toString() ,'Thanks for donating to me, have a nice day !')
			}
		});
	} else {
		offer.decline((err) => {
			if (err) {
				console.log(err);
			} else {
				console.log('Donation declined (wanted our items).');
			}
		});
	}
});
