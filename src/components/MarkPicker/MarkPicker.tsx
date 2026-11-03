import type { FC } from 'react';

import MarkIcon from '@/components/MarkIcon';
import cn from '@/lib/cn';
import type { Mark } from '@convex/rules';

const OPTIONS: { mark: Mark, title: string, hint: string }[] = [
    { mark: 'circle', title: 'Circle', hint: 'First' },
    { mark: 'cross', title: 'Cross', hint: 'Second' }
];

type MarkPickerProps = {
    value: Mark,
    onChange: (mark: Mark) => void
};

const MarkPicker: FC<MarkPickerProps> = ({ value, onChange }) => (
    <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-medium text-label">Play as</legend>
        <div className="grid grid-cols-2 gap-3">
            { OPTIONS.map(option => (
                <label
                    key={ option.mark }
                    className={
                        cn([
                            'flex h-15 cursor-pointer items-center gap-3 rounded-2xl border-2 border-border bg-field px-3 transition not-data-checked:hover:border-option-hover not-data-checked:hover:bg-card active:scale-98 has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background',
                            'md:h-20 md:gap-4 md:px-4'
                        ], {
                            'data-checked:border-circle data-checked:bg-circle/12': option.mark === 'circle',
                            'data-checked:border-cross data-checked:bg-cross/12': option.mark === 'cross'
                        })
                    }
                    data-checked={ value === option.mark ? '' : undefined }
                >
                    <input
                        type="radio"
                        name="mark"
                        value={ option.mark }
                        checked={ value === option.mark }
                        className="sr-only"
                        onChange={
                            () => {
                                onChange(option.mark);
                            }
                        }
                    />
                    <MarkIcon
                        mark={ option.mark }
                        className={
                            cn([
                                'size-7 shrink-0',
                                'md:size-10'
                            ])
                        }
                    />
                    <span className="flex min-w-0 flex-col gap-1">
                        <span className="font-semibold">{ option.title }</span>
                        <span className="text-sm whitespace-nowrap text-muted-foreground">{ option.hint }</span>
                    </span>
                </label>
            )) }
        </div>
    </fieldset>
);

export default MarkPicker;
