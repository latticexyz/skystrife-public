import { NetworkLayer } from "client/src/layers/Network";
import { DateTime } from "luxon";
import { Has, Not, NotValue, runQuery, getComponentValueStrict } from "@latticexyz/recs";
import { Message } from "discord.js";

export function announceUpcomingScheduledMatches(networkLayer: NetworkLayer, message: Message) {
  const {
    components: { MatchConfig, MatchFinished },
  } = networkLayer;

  function getFirstScheduledTimeInFuture() {
    const now = DateTime.now().toUTC();

    const scheduledMatchTimes: bigint[] = [];

    const scheduledMatches = [
      ...runQuery([Has(MatchConfig), Not(MatchFinished), NotValue(MatchConfig, { registrationTime: BigInt(0) })]),
    ];

    for (const match of scheduledMatches) {
      const registrationTime = getComponentValueStrict(MatchConfig, match).registrationTime;
      if (registrationTime < now.toSeconds()) continue;

      scheduledMatchTimes.push(registrationTime);
    }

    return scheduledMatchTimes.sort((a, b) => Number(a - b))[0];
  }

  const time = getFirstScheduledTimeInFuture();
  message.reply(`The next round of free matches will be available <t:${time.toString()}:R>`);
}
