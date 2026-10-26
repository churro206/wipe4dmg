import { activities, bosses } from "../data";
import { seconds } from "../format";

/** Encounter: the Damage Phase length, typed in or taken from a boss. */
export function EncounterSection({
  input,
  bossId,
  onInput,
  onCommitInput,
  onSelectBoss,
}: {
  input: string;
  bossId: string;
  onInput: (value: string) => void;
  onCommitInput: (value: string) => void;
  onSelectBoss: (id: string) => void;
}) {
  const boss = bosses.find((b) => b.id === bossId);
  return (
    <>
      <h2>Encounter</h2>
      <div className="phase-row">
        <label>
          Damage Phase (s)
          <input
            type="number"
            min="0"
            step="any"
            value={input}
            onChange={(event) => onInput(event.target.value)}
            onBlur={(event) => onCommitInput(event.target.value)}
          />
        </label>
        <label>
          Boss
          <select
            value={bossId}
            onChange={(event) => onSelectBoss(event.target.value)}
          >
            <option value="">– custom –</option>
            {activities.map((activity) => (
              <optgroup key={activity} label={activity}>
                {bosses
                  .filter((b) => b.activity === activity)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (
                      {seconds.format(b.damagePhaseSeconds.value ?? NaN)} s)
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
      </div>
      {boss?.description && <p className="note">{boss.description}</p>}
    </>
  );
}
