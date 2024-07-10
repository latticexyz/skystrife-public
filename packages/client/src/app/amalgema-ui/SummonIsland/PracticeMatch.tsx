import { Body, OverlineSmall } from "../../ui/Theme/SkyStrife/Typography";
import { Checkbox } from "../../ui/Theme/SkyStrife/Checkbox";

export function PracticeMatch({
  practiceMatch,
  setPracticeMatch,
}: {
  practiceMatch: boolean;
  setPracticeMatch: (practiceMatch: boolean) => void;
}) {
  return (
    <div>
      <OverlineSmall className="text-ss-text-x-light">Casual Match</OverlineSmall>
      <Body className="text-ss-default">
        Casual matches cost 5🔮 to create and give no rewards. They are a great way to play with friends without
        worrying about the cost. Creating one does not count towards your limit of created custom matches.
      </Body>

      <div className="h-4" />

      <div className="w-full flex items-center h-[30px]">
        <div className="w-1/2">
          <Checkbox
            isChecked={practiceMatch}
            setIsChecked={(isChecked) => {
              setPracticeMatch(isChecked);
            }}
            uncheckedLabel="Reward Match"
            checkedLabel="Casual Match"
          />
        </div>
      </div>
    </div>
  );
}
