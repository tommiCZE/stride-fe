import {Box, Button, Chip, IconButton, MenuItem, Switch, TextField, Typography} from '@mui/material';
import {SectionHeader, SettingsCard, FieldRow, COLOR_PALETTE, ColorSwatch} from '../shared';
import {useProjectSettings, type EstimateUnit} from '../../../store/project-settings-store';
import {
    useProjectTaskTypesRes, useProjectPrioritiesRes, useProjectCustomFieldsRes,
    useProjectIssueLinkTypesRes,
} from '../../../hooks/useProjectSettingsResources';
import {useProjectLabels} from '../../../hooks/useLabels';
import type {LabelDto, ProjectDto} from '../../../api/types';
import type {ProjectCustomFieldDto, ProjectIssueLinkTypeDto} from '../../../api/project-settings';
import {PlusIcon, CloseIcon} from '../../../components/icons/icons';

function uid(prefix: string) {
    return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function TaskConfigSection({project, readOnly}: { project: ProjectDto; readOnly: boolean }) {
    const {settings, update} = useProjectSettings(project.key);
    const taskTypes = useProjectTaskTypesRes(project.key);
    const priorities = useProjectPrioritiesRes(project.key);
    const customFields = useProjectCustomFieldsRes(project.key);
    const linkTypes = useProjectIssueLinkTypesRes(project.key);
    const labels = useProjectLabels(project.id);

    return (
            <Box>
                <SectionHeader
                        title="Tasky, labely a fieldy"
                        hint="Vlastní typy, priority, labely a custom fieldy specifické pro tento projekt."
                />

                <SettingsCard title="Typy tasků" description="Zapni/vypni typy a definuj jaké fieldy jsou povinné.">
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
                        {taskTypes.data.map((t, i) => (
                                <Box key={t.id} sx={{
                                    display: 'flex', alignItems: 'center', gap: 1, p: 1,
                                    borderRadius: 1, border: 1, borderColor: 'divider',
                                }}>
                                    <Box sx={{width: 10, height: 10, borderRadius: '50%', bgcolor: t.color}}/>
                                    <TextField
                                            size="small" value={t.name}
                                            onChange={e => taskTypes.replace(taskTypes.data.map((x, j) => j === i ? {
                                                ...x,
                                                name: e.target.value
                                            } : x))}
                                            disabled={readOnly}
                                            sx={{width: 180}}
                                    />
                                    <Box sx={{flex: 1, display: 'flex', gap: 0.25, flexWrap: 'wrap'}}>
                                        {t.requiredFields.length === 0
                                                ? <Typography sx={{fontSize: 11, color: 'text.disabled'}}>žádné povinné fieldy</Typography>
                                                : t.requiredFields.map(rf => (
                                                        <Chip key={rf} size="small" label={rf} variant="outlined"
                                                                onDelete={readOnly ? undefined : () => taskTypes.replace(taskTypes.data.map((x, j) =>
                                                                        j === i ? {...x, requiredFields: x.requiredFields.filter(f => f !== rf)} : x,
                                                                ))}/>
                                                ))
                                        }
                                    </Box>
                                    <Switch
                                            size="small" checked={t.enabled} disabled={readOnly}
                                            onChange={(_, v) => taskTypes.replace(taskTypes.data.map((x, j) => j === i ? {...x, enabled: v} : x))}
                                    />
                                    <IconButton size="small" disabled={readOnly}
                                            onClick={() => taskTypes.replace(taskTypes.data.filter((_, j) => j !== i))}>
                                        <CloseIcon/>
                                    </IconButton>
                                </Box>
                        ))}
                    </Box>
                    <Button
                            size="small" startIcon={<PlusIcon/>} disabled={readOnly} sx={{mt: 1}}
                            onClick={() => taskTypes.replace([...taskTypes.data, {
                                id: crypto.randomUUID(),
                                key: uid('TT').toUpperCase(),
                                name: 'Nový typ',
                                color: '#64748b',
                                enabled: true,
                                requiredFields: [],
                                sortOrder: taskTypes.data.length,
                            }])}
                    >Přidat typ tasku</Button>
                </SettingsCard>

                <SettingsCard title="Priority" description="Mění se po celé aplikaci včetně boardu a reportů.">
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
                        {priorities.data.map((p, i) => (
                                <Box key={p.id} sx={{
                                    display: 'flex', alignItems: 'center', gap: 1, p: 1,
                                    borderRadius: 1, border: 1, borderColor: 'divider',
                                }}>
                                    <Box sx={{width: 10, height: 10, borderRadius: '50%', bgcolor: p.color}}/>
                                    <TextField
                                            size="small" value={p.name} disabled={readOnly}
                                            onChange={e => priorities.replace(priorities.data.map((x, j) => j === i ? {
                                                ...x,
                                                name: e.target.value
                                            } : x))}
                                            sx={{width: 180}}
                                    />
                                    <Box sx={{flex: 1, display: 'flex', gap: 0.5}}>
                                        {COLOR_PALETTE.slice(0, 7).map(c => (
                                                <ColorSwatch
                                                        key={c} color={c} size={16} selected={c === p.color}
                                                        onClick={readOnly ? undefined : () => priorities.replace(
                                                                priorities.data.map((x, j) => j === i ? {...x, color: c} : x),
                                                        )}
                                                />
                                        ))}
                                    </Box>
                                    <Switch
                                            size="small" checked={p.enabled} disabled={readOnly}
                                            onChange={(_, v) => priorities.replace(priorities.data.map((x, j) => j === i ? {...x, enabled: v} : x))}
                                    />
                                </Box>
                        ))}
                    </Box>
                </SettingsCard>

                <SettingsCard title="Labely" description="Volně tvořené labely pro tagování tasků v tomto projektu.">
                    <LabelsEditor
                            labels={labels.data}
                            projectId={project.id}
                            readOnly={readOnly}
                            onChange={(next) => labels.replace(next)}
                    />
                </SettingsCard>

                <SettingsCard title="Custom fields" description="Pole, která budou součástí formuláře pro vytvoření tasku.">
                    <CustomFieldsEditor
                            fields={customFields.data}
                            taskTypeKeys={taskTypes.data.map(t => t.key)}
                            readOnly={readOnly}
                            onChange={(next) => customFields.replace(next)}
                    />
                </SettingsCard>

                <SettingsCard title="Typy linků" description="Vlastní typy vztahů mezi tasky (např. „blocks” ↔ „is blocked by”).">
                <IssueLinkTypesEditor
                        linkTypes={linkTypes.data}
                        readOnly={readOnly}
                        onChange={(next) => linkTypes.replace(next)}
                />
            </SettingsCard>

    <SettingsCard title="Výchozí hodnoty" description="Co se předvyplní při vytvoření nového tasku.">
        <FieldRow label="Výchozí typ">
            <TextField
                    size="small" select value={settings.defaultTaskType}
                    onChange={e => update({defaultTaskType: e.target.value})}
                    disabled={readOnly} sx={{width: 180}}
            >
                {taskTypes.data.filter(t => t.enabled).map(t => (
                        <MenuItem key={t.id} value={t.key}>{t.name}</MenuItem>
                ))}
            </TextField>
        </FieldRow>
        <FieldRow label="Výchozí priorita">
            <TextField
                    size="small" select value={settings.defaultPriority}
                    onChange={e => update({defaultPriority: e.target.value})}
                    disabled={readOnly} sx={{width: 180}}
            >
                {priorities.data.filter(p => p.enabled).map(p => (
                        <MenuItem key={p.id} value={p.key}>{p.name}</MenuItem>
                ))}
            </TextField>
        </FieldRow>
        <FieldRow label="Jednotka odhadu" hint="V čem se odhadují story / tasky.">
            <TextField
                    size="small" select value={settings.estimateUnit}
                    onChange={e => update({estimateUnit: e.target.value as EstimateUnit})}
                    disabled={readOnly} sx={{width: 220}}
            >
                <MenuItem value="points">Story points</MenuItem>
                <MenuItem value="hours">Hodiny</MenuItem>
                <MenuItem value="tshirt">T-shirt size (XS–XL)</MenuItem>
            </TextField>
        </FieldRow>
    </SettingsCard>
</Box>
)
    ;
}

function CustomFieldsEditor({fields, taskTypeKeys, readOnly, onChange}: {
    fields: ProjectCustomFieldDto[];
    taskTypeKeys: string[];
    readOnly: boolean;
    onChange: (f: ProjectCustomFieldDto[]) => void;
}) {
    return (
            <Box>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                    {fields.map((f, i) => (
                            <Box key={f.id} sx={{
                                display: 'flex', flexDirection: 'column', gap: 1, p: 1.25,
                                border: 1, borderColor: 'divider', borderRadius: 1,
                            }}>
                                <Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
                                    <TextField
                                            size="small" value={f.name} disabled={readOnly}
                                            onChange={e => onChange(fields.map((x, j) => j === i ? {...x, name: e.target.value} : x))}
                                            sx={{flex: 1}}
                                    />
                                    <TextField
                                            size="small" select value={f.fieldType} disabled={readOnly}
                                            onChange={e => onChange(fields.map((x, j) => j === i ? {
                                                ...x,
                                                fieldType: e.target.value as ProjectCustomFieldDto['fieldType']
                                            } : x))}
                                            sx={{width: 140}}
                                    >
                                        <MenuItem value="text">Text</MenuItem>
                                        <MenuItem value="number">Číslo</MenuItem>
                                        <MenuItem value="select">Výběr</MenuItem>
                                        <MenuItem value="date">Datum</MenuItem>
                                        <MenuItem value="user">Uživatel</MenuItem>
                                    </TextField>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                        <Typography sx={{fontSize: 11.5, color: 'text.secondary'}}>Povinné</Typography>
                                        <Switch size="small" checked={f.required} disabled={readOnly}
                                                onChange={(_, v) => onChange(fields.map((x, j) => j === i ? {...x, required: v} : x))}/>
                                    </Box>
                                    <IconButton size="small" disabled={readOnly}
                                            onClick={() => onChange(fields.filter((_, j) => j !== i))}>
                                        <CloseIcon/>
                                    </IconButton>
                                </Box>
                                {f.fieldType === 'select' && (
                                        <TextField
                                                size="small" placeholder="možnosti oddělené čárkou"
                                                value={f.options.join(', ')} disabled={readOnly}
                                                onChange={e => onChange(fields.map((x, j) => j === i ? {
                                                    ...x, options: e.target.value.split(',').map(o => o.trim()).filter(Boolean),
                                                } : x))}
                                        />
                                )}
                                <Box sx={{display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap'}}>
                                    <Typography sx={{fontSize: 11.5, color: 'text.secondary', mr: 0.5}}>Platí pro typy:</Typography>
                                    {taskTypeKeys.map(tt => {
                                        const on = f.appliesTo.includes(tt);
                                        return (
                                                <Chip key={tt} size="small" label={tt}
                                                        variant={on ? 'filled' : 'outlined'}
                                                        color={on ? 'primary' : 'default'}
                                                        onClick={readOnly ? undefined : () => onChange(fields.map((x, j) =>
                                                                j === i ? {
                                                                    ...x,
                                                                    appliesTo: on ? x.appliesTo.filter(t => t !== tt) : [...x.appliesTo, tt],
                                                                } : x,
                                                        ))}
                                                />
                                        );
                                    })}
                                </Box>
                            </Box>
                    ))}
                </Box>
                <Button
                        size="small" startIcon={<PlusIcon/>} disabled={readOnly} sx={{mt: 1.25}}
                        onClick={() => onChange([...fields, {
                            id: crypto.randomUUID(),
                            key: uid('cf').toLowerCase(),
                            name: 'Nový field',
                            fieldType: 'text',
                            options: [],
                            required: false,
                            appliesTo: [],
                            sortOrder: fields.length,
                        }])}
                >Přidat custom field</Button>
            </Box>
    );
}

function IssueLinkTypesEditor({linkTypes, readOnly, onChange}: {
    linkTypes: ProjectIssueLinkTypeDto[];
    readOnly: boolean;
    onChange: (l: ProjectIssueLinkTypeDto[]) => void;
}) {
    return (
            <Box>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
                    {linkTypes.map((l, i) => (
                            <Box key={l.id} sx={{
                                display: 'flex', alignItems: 'center', gap: 1, p: 1,
                                borderRadius: 1, border: 1, borderColor: 'divider',
                            }}>
                                <Box sx={{width: 10, height: 10, borderRadius: '50%', bgcolor: l.color, flexShrink: 0}}/>
                                <TextField
                                        size="small" value={l.outwardLabel} disabled={readOnly}
                                        placeholder="blocks"
                                        onChange={e => onChange(linkTypes.map((x, j) => j === i ? {...x, outwardLabel: e.target.value} : x))}
                                        sx={{flex: 1}}
                                />
                                <Typography sx={{fontSize: 11, color: 'text.disabled', userSelect: 'none'}}>↔</Typography>
                                <TextField
                                        size="small" value={l.inwardLabel} disabled={readOnly}
                                        placeholder="is blocked by"
                                        onChange={e => onChange(linkTypes.map((x, j) => j === i ? {...x, inwardLabel: e.target.value} : x))}
                                        sx={{flex: 1}}
                                />
                                <TextField
                                        size="small" value={l.key} disabled={readOnly}
                                        onChange={e => onChange(linkTypes.map((x, j) => j === i ? {...x, key: e.target.value.toUpperCase()} : x))}
                                        sx={{width: 100, '& .MuiInputBase-root': {fontFamily: 'ui-monospace, monospace', fontSize: 11.5}}}
                                />
                                <Box sx={{display: 'flex', gap: 0.5}}>
                                    {COLOR_PALETTE.slice(0, 7).map(c => (
                                            <ColorSwatch
                                                    key={c} color={c} size={16} selected={c === l.color}
                                                    onClick={readOnly ? undefined : () => onChange(
                                                            linkTypes.map((x, j) => j === i ? {...x, color: c} : x),
                                                    )}
                                            />
                                    ))}
                                </Box>
                                <IconButton size="small" disabled={readOnly}
                                        onClick={() => onChange(linkTypes.filter((_, j) => j !== i))}>
                                    <CloseIcon/>
                                </IconButton>
                            </Box>
                    ))}
                    {linkTypes.length === 0 && (
                            <Typography sx={{fontSize: 12, color: 'text.disabled', py: 1, textAlign: 'center'}}>
                                Žádné vlastní typy linků — výchozí ("relates to") se použije pro všechny vazby.
                            </Typography>
                    )}
                </Box>
                <Button
                        size="small" startIcon={<PlusIcon/>} disabled={readOnly} sx={{mt: 1}}
                        onClick={() => onChange([...linkTypes, {
                            id: crypto.randomUUID(),
                            key: uid('LT').toUpperCase(),
                            outwardLabel: 'relates to',
                            inwardLabel: 'relates to',
                            color: COLOR_PALETTE[linkTypes.length % 7],
                            sortOrder: linkTypes.length,
                        }])}
                >Přidat typ linku</Button>
            </Box>
    );
}

function LabelsEditor({labels, projectId, readOnly, onChange}: {
    labels: LabelDto[];
    projectId: string;
    readOnly: boolean;
    onChange: (l: LabelDto[]) => void;
}) {
    return (
            <Box>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5}}>
                    {labels.map((l, i) => (
                            <Box key={l.id} sx={{
                                display: 'flex', alignItems: 'center', gap: 1, p: 1,
                                borderRadius: 1, border: 1, borderColor: 'divider',
                            }}>
                                <Box sx={{width: 10, height: 10, borderRadius: '50%', bgcolor: l.color}}/>
                                <TextField
                                        size="small" value={l.name} disabled={readOnly}
                                        onChange={e => onChange(labels.map((x, j) => j === i ? {...x, name: e.target.value} : x))}
                                        sx={{flex: 1}}
                                />
                                <Box sx={{display: 'flex', gap: 0.5}}>
                                    {COLOR_PALETTE.slice(0, 7).map(c => (
                                            <ColorSwatch
                                                    key={c} color={c} size={16} selected={c === l.color}
                                                    onClick={readOnly ? undefined : () => onChange(
                                                            labels.map((x, j) => j === i ? {...x, color: c} : x),
                                                    )}
                                            />
                                    ))}
                                </Box>
                                <IconButton size="small" disabled={readOnly}
                                        onClick={() => onChange(labels.filter((_, j) => j !== i))}>
                                    <CloseIcon/>
                                </IconButton>
                            </Box>
                    ))}
                </Box>
                <Button
                        size="small" startIcon={<PlusIcon/>} disabled={readOnly} sx={{mt: 1}}
                        onClick={() => onChange([...labels, {
                            id: crypto.randomUUID(),
                            name: 'Nový label',
                            color: COLOR_PALETTE[labels.length % COLOR_PALETTE.length],
                            projectId,
                        }])}
                >Přidat label</Button>
            </Box>
    );
}
