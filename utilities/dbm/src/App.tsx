import React, { useEffect, useState } from 'react';

import './App.css';
import { ActionButton, Icon, mergeStyles, Pivot, PivotItem, ThemeProvider, createTheme, merge, Dropdown, CommandBar, CommandButton, PrimaryButton, Link, TextField } from '@fluentui/react'
import { createEntity, createSQLDiff, DiffErr, getTableDefs, listEntity, updateEntity, updateServer } from './api';
import { CalcTypes, Entity, EntityField, EntityView, TableDefs } from './shared/interfaces/Entity';
import { makeEntityDefs } from './shared/code/code-gen';
import { ensureSnake } from './shared/code/code-gen-util';

const myTheme = createTheme({
  palette: {
    themePrimary: '#0d96ff',
    themeLighterAlt: '#01060a',
    themeLighter: '#021829',
    themeLight: '#042d4d',
    themeTertiary: '#085a99',
    themeSecondary: '#0b84e0',
    themeDarkAlt: '#25a1ff',
    themeDark: '#47afff',
    themeDarker: '#77c4ff',
    neutralLighterAlt: '#262a32',
    neutralLighter: '#262931',
    neutralLight: '#24282f',
    neutralQuaternaryAlt: '#22252c',
    neutralQuaternary: '#20232a',
    neutralTertiaryAlt: '#1f2228',
    neutralTertiary: '#c8c8c8',
    neutralSecondary: '#d0d0d0',
    neutralSecondaryAlt: '#d0d0d0',
    neutralPrimaryAlt: '#dadada',
    neutralPrimary: '#ffffff',
    neutralDark: '#f4f4f4',
    black: '#f8f8f8',
    white: '#282c34',
  }
});

const darkTheme = {
  "themePrimary": "#72aedb",
  "themeLighterAlt": "#050709",
  "themeLighter": "#121c23",
  "themeLight": "#223442",
  "themeTertiary": "#446884",
  "themeSecondary": "#6499c1",
  "themeDarkAlt": "#7fb5df",
  "themeDark": "#91c0e4",
  "themeDarker": "#acd0eb",
  "neutralLighterAlt": "#000000",
  "neutralLighter": "#000000",
  "neutralLight": "#000000",
  "neutralQuaternaryAlt": "#000000",
  "neutralQuaternary": "#000000",
  "neutralTertiaryAlt": "#000000",
  "neutralTertiary": "#c8c8c8",
  "neutralSecondary": "#d0d0d0",
  "neutralSecondaryAlt": "#d0d0d0",
  "neutralPrimaryAlt": "#dadada",
  "neutralPrimary": "#ffffff",
  "neutralDark": "#f4f4f4",
  "black": "#f8f8f8",
  "white": "#000000"
}


function minViews(name: string) {
  return [
    { fieldNames: [], name: name + "_list" },
    { fieldNames: [], name: name + "_get" },
  ]
}

type VTDef = { name: string, fields: string[] };
interface DepData {
  data: any, viewsAndTables: VTDef[], tableFields: EntityField[], onChange: (text: string) => void, locked?: boolean, field: EntityField
}

type DependantRecord<T extends string = string> = Record<T, ((data: DepData) => (JSX.Element | null))>






class DependantProperty {
  fieldProperty: string
  constructor(fieldProperty: string) {
    this.fieldProperty = fieldProperty;
  }
  Element(props: { value: any, onChange: (text: string) => void, tableFields: EntityField[], fieldProperty: string, currentProperty: string, field: any, viewsAndTables: VTDef[] }) {
    const { value, tableFields, field, currentProperty, viewsAndTables, fieldProperty, onChange } = props,
      record: DependantRecord = fieldProperties[fieldProperty as keyof typeof fieldProperties] as any;

    //Not great assumptions can be cleaned up later 
    try {
      return record[field[fieldProperty] || Object.keys(record)[0]]({
        data: value,
        viewsAndTables,
        locked: field.locked,
        onChange,
        field,
        tableFields
      });
    }
    catch (ex) {
      console.error(ex);
      return <span>#Err</span>;
    }
  }
}
export const DataTypes: DependantRecord = {
  "bigserial": () => null,
  "integer": () => null,
  "bigint": () => null,
  "UUID": () => null,
  "money": () => null,
  "timestamptz": () => null,
  "date": ()=> null,
  "boolean": () => null,
  "text": (data) => {

    return <select
      defaultValue={data.data}
      disabled={data.locked}
      onChange={(ev) => {
        data.onChange(ev.currentTarget.value);
      }}>
      <option></option>
      {[10,
        75,
        255,
        4000].map((i) => {
          return <option value={i}>{i}</option>
        })}
    </select>

  },
  "json": (data) => {
    return data.field.calcType === "json" ? null :
      <input disabled={data.locked} defaultValue={data.data} onInput={(ev) => {
        data.onChange(ev.currentTarget.value);
      }} placeholder='Define Type' />
  }
}

const CalcType: DependantRecord<CalcTypes> = {
  "none": () => {
    return null;
  },
  "json": (data) => <TableKey data={data} />,
  "count": (data) => <TableKey data={data} />,
  "exists": (data) => <TableKey data={data} />,
  "inline": (data) => {
    return <input disabled={data.locked} defaultValue={data.data} onInput={(ev) => {
      data.onChange(ev.currentTarget.value);
    }} placeholder='Inline SQL' />
  }
}
const fieldProperties = {
  "PK": "booleanOne",
  "name": "string",
  "dataType": DataTypes,
  "maxLength": new DependantProperty("dataType"),
  "nullable": "boolean",
  "filter": "boolean",
  "private": "boolean",
  "calcType": CalcType,
  "calc": new DependantProperty("calcType"),
}


function TableKey(props: { data: DepData }) {
  const { data } = props;
  const pk = data.tableFields?.find(f => f.PK)
  const [table, key, selfKey = pk?.name] = (props.data.data as string)?.split("|") || [];

  return data.locked ? <div style={{ whiteSpace: "nowrap" }} >{table}.{key}{"->"}{selfKey || pk?.name}</div> : <div className={mergeStyles({
    display: "flex"
  })}><select
    disabled={data.locked}
    defaultValue={table} placeholder='Related Table Or View' onChange={(ev) => {
      data.onChange(ev.currentTarget.value);
    }}>
      <option></option>
      {data.viewsAndTables.map((l) =>
        <option value={l.name}>{l.name}</option>)}
    </select>
    <select
      disabled={data.locked}
      defaultValue={key} placeholder='Related Table Or View' onChange={(ev) => {
        data.onChange(table + "|" + ev.currentTarget.value);
        data.onChange(`${table}|${ev.currentTarget.value || ""}|${selfKey}`);
      }}>
      <option></option>
      {data.viewsAndTables.find(v => v.name === table)?.fields.map((f) =>
        <option value={f}>{f}</option>)}
    </select><span style={{ whiteSpace: "nowrap" }}>{"->"}</span>
    <select
      disabled={data.locked}
      defaultValue={selfKey} placeholder='MatchId' onChange={(ev) => {
        data.onChange(`${table}|${key}|${ev.currentTarget.value || ""}`);
      }}>
      <option>{pk?.name}</option>
      {data.tableFields?.filter(f => !f.PK).map((f) =>
        <option value={f.name}>{f.name}</option>)}
    </select>
  </div>
}
// const makeDeleteFunction = () => {
//   return `CREATE OR REPLACE FUNCTION public.${}_delete(
//       request json)
//       RETURNS SETOF entities 
//       LANGUAGE 'plpgsql'
//   AS $BODY$
//   BEGIN
//      return query SELECT * FROM Entities where name = request->>name;
//   END;
//   $BODY$;`
// }

const links = {
  "AWS Portal": "https://670171407375.signin.aws.amazon.com/",
  "Web App": "tradingpost-app-dev.eba-mvf3kcje.us-east-1.elasticbeanstalk.com",
}

function App() {

  const [entities, setEntities] = useState<Entity[]>(),
    [errors, setErrors] = useState<Record<string, DiffErr[]>>({}),
    [newEntityName, setNewEntity] = useState<string>(),
    [disableAdd, setDisableAdd] = useState<boolean>(),
    resetEntities = () => setEntities(undefined),
    [entity, setEntity] = useState<Entity>(),
    [fields, setFields] = useState<EntityField[]>(),
    [deleteFields, setDeleteFields] = useState<Record<string, true>>({}),
    [views, setViews] = useState<EntityView[]>(),
    [defs, setDefs] = useState({
      table: "",
      views: {} as Record<string, { definition: string }>,
      interfaces: "",
      functions: "",
      api: ""
    });


  useEffect(() => {
    if (entities === undefined) {
      (async () => {
        const resp = await listEntity();
        if (resp)
          setEntities(resp
            .map(e => {
              e.definition?.views?.forEach((v) => {
                if (v.name.toLowerCase() === (e.name.replaceAll("_", "") + "list").toLowerCase()) {
                  v.name = `${e.name}_list`
                }
                else if (v.name.toLowerCase() === (e.name.replaceAll("_", "") + "get").toLowerCase()) {
                  v.name = `${e.name}_get`
                }
              })
              return e;

            })
            .sort((a, b) => a.name.localeCompare(b.name)))
        else
          alert("Something went wrong check console errors.")
      })()
    }
  }, [entities === undefined])

  const [existingDefs, setExistingDefs] = useState<TableDefs[]>();
  useEffect(() => {
    (async () => {
      try {
        setExistingDefs(await getTableDefs());
      }
      catch (ex) {
        console.error(ex);
      }
    })()
  }, [])

  useEffect(() => {
    if (fields && entity && existingDefs && entities) {

      const defs = makeEntityDefs(entity, deleteFields, false, existingDefs.filter((d) => d.table_name === (entity.definition?.tableNameOverride || `data_${ensureSnake(entity.name)}`)), entities);
      setDefs(defs || {
        api: "",
        functions: "",
        interfaces: "",
        table: "",
        fields: {},
        views: {}
      });
    }
  }, [deleteFields, fields, entity, views, existingDefs, entities]);


  const fieldPropKeys = Object.keys(fieldProperties);

  return (
    <ThemeProvider
      applyTo="body"
      theme={myTheme}
    >
      <div className={mergeStyles("App", { width: 1240, margin: "1rem auto", flexBasis: "border-box" })}>
        <header className={mergeStyles("App-header", { width: "100%" })} >
          <div className={mergeStyles({ display: "flex", flexDirection: "row", width: "100%" })}>
            <h1 className={mergeStyles({ alignSelf: "stretch", flexGrow: 1 })}>Entity Manager</h1>
          </div>
          <div className={mergeStyles({ display: "flex", flexDirection: "row", width: "100%" })}>
            <div className={mergeStyles({ order: 1, flexGrow: 1 })}>

              {
                !entity && Object.keys(links).map((s) => <Link target='__blank' href={links[s as keyof typeof links]} >{s}</Link>)
              }
              {entity &&
                <div>
                  <h2>{entity?.name} <input placeholder='Table Name Override' className={mergeStyles({ marginLeft: "1rem", marginRight: "4rem", marginTop: "0.5rem" })} value={entity.definition?.tableNameOverride}
                    onInput={(ev) => {
                      if (!entity.definition)
                        entity.definition = {}
                      entity.definition.tableNameOverride = ev.currentTarget.value
                    }} /></h2>
                  <div>
                    <CommandButton text='Add Field' iconProps={{ iconName: "Add" }}
                      onClick={() => {
                        let newName = "newField";
                        while (fields?.find(f => f.name === newName)) {
                          newName += " 1";
                        }
                        setFields([...(fields || []), {
                          name: newName,
                          dataType: "text",
                        }])
                      }}
                    />
                    <CommandButton text='Add View' iconProps={{ iconName: "Add" }}
                      onClick={() => {
                        setViews([...(views || []), { name: "NewView", fieldNames: [] }])
                      }}
                    />
                    <CommandButton text='Save Changes' iconProps={{ iconName: "Save" }}
                      onClick={async () => {
                        if (entity) {

                          try {
                            //clean view fields
                            views?.forEach(v => v.fieldNames = v.fieldNames.filter(fn => fields?.find(f => f.name === fn)))

                            entity.definition = {
                              tableNameOverride: entity.definition?.tableNameOverride,
                              fields: fields?.filter(f => !deleteFields[f.name]) || [],
                              views: views || []
                            }
                            await updateEntity(entity);
                            setFields(fields => fields?.filter(f => !deleteFields[f.name]))
                          }
                          catch (ex) {
                            alert(ex)
                          }
                        }
                      }}
                    />
                  </div>
                  <Pivot>
                    <PivotItem headerText='Fields' itemKey='fields'>
                      <table>
                        <tr>
                          <th colSpan={fieldPropKeys.length}><u>Field Properties</u></th>
                          <th colSpan={0}><u>Views</u></th>
                        </tr>
                        <tr>{fieldPropKeys.map((k) => <th>{k}</th>)}
                          {
                            views?.map((v, i) =>
                              i <= 1 ?
                                <th>{v.name}</th> :
                                <th><input value={v.name}
                                  onChange={(ev) => {
                                    v.name = ev.currentTarget.value;
                                    setViews([...views]);
                                  }}
                                /></th>
                            )
                          }
                          <th></th>
                          <th></th>
                          <th></th>
                        </tr>
                        {
                          fields?.map((f) =>
                            <tr className={mergeStyles({
                              opacity: deleteFields[f.name] ? 0.3 : undefined,
                              "input:disabled, select:disabled, option:disabled": {
                                background: "azure !important",
                                opacity: 1
                              },
                              ".trash-icon": {
                                opacity: deleteFields[f.name] ? 1 : 0
                              },
                              ".lock-icon": {
                                opacity: f.locked ? 1 : 0
                              },
                              ".draft-icon": {
                                opacity: f.draft ? 1 : 0
                              },
                              ":hover .trash-icon, :hover .lock-icon, :hover .draft-icon": {
                                opacity: 1,
                                cursor: "pointer"
                              }
                            })}>
                              {
                                fieldPropKeys.map((k) => {
                                  type fKey = keyof typeof f;
                                  const value = fieldProperties[k as keyof typeof fieldProperties];
                                  let output: any;
                                  const curVal = f[k as fKey];
                                  if (typeof value === "object") {
                                    if (value instanceof DependantProperty) {
                                      const { Element } = value;
                                      output = <Element onChange={(v) => {
                                        (f as any)[k as fKey] = v as any
                                        setFields([...fields]);
                                      }}

                                        fieldProperty={value.fieldProperty} value={curVal} currentProperty={k} field={f}
                                        tableFields={fields?.filter(f => !f.calc) || []}
                                        viewsAndTables={
                                          entities?.flatMap(e =>
                                            (e.definition?.views || minViews(e.name))
                                              .map(v => ({
                                                name: v.name, fields: v.fieldNames
                                              })))
                                          || []} />
                                    }
                                    else {
                                      output = <select value={curVal as string}
                                        disabled={f.locked}
                                        onChange={(ev) => {
                                          (f as any)[k as fKey] = ev.currentTarget.value as any
                                          setFields([...fields]);
                                        }}
                                      >
                                        {Object.keys(value).map((v) => <option value={v}>{v}</option>)
                                        }</select>
                                    }
                                  }
                                  else if (value === "boolean" || value === "booleanOne") {
                                    output = <input type={"checkbox"}
                                      readOnly={f.locked}
                                      onChange={(ev) => {
                                        if (!ev.currentTarget.readOnly) {
                                          (f as any)[k as fKey] = ev.currentTarget.checked as any
                                          if (value === "booleanOne" && ev.currentTarget.checked) {
                                            fields.forEach(_f => {
                                              if (_f.name !== f.name) {
                                                (_f as any)[k as fKey] = false;
                                              }
                                            })
                                          }
                                          setFields([...fields]);
                                        }

                                      }}
                                      checked={curVal as boolean} />
                                  }
                                  else output = <input value={String(curVal || "")}
                                    disabled={f.locked}
                                    onChange={(ev) => {
                                      if (k as fKey === "name") {
                                        (f as any)[k as fKey] = ensureSnake(ev.currentTarget.value as any)
                                      }
                                      else {
                                        (f as any)[k as fKey] = ev.currentTarget.value as any
                                      }
                                      setFields([...fields]);
                                    }}
                                  ></input>
                                  return <td>{output}</td>
                                })
                              }
                              {
                                views?.map((v) =>
                                  <td>
                                    <input type={"checkbox"} checked={Boolean(v.fieldNames.find(name => name === f.name))}
                                      readOnly={f.locked}
                                      onChange={(c) => {
                                        if (!c.currentTarget.readOnly) {
                                          if (!c.currentTarget.checked)
                                            v.fieldNames = v.fieldNames.filter(n => n !== f.name);
                                          else
                                            v.fieldNames.push(f.name);
                                          setViews([...views])
                                        }
                                      }}
                                    />
                                  </td>)
                              }
                              <td><Icon
                                title='Draft Mode'
                                onClick={() => {
                                  f.draft = !f.draft;
                                  setFields([...fields]);
                                }}
                                className='draft-icon'
                                iconName='Hide3'
                              />
                              </td>
                              <td><Icon
                                title='Lock'
                                onClick={() => {
                                  f.locked = !f.locked;
                                  setFields([...fields]);
                                }}
                                className='lock-icon'
                                iconName='lock'
                              />
                              </td>
                              <td><Icon
                                onClick={() => {
                                  const _deletedFields = {
                                    ...deleteFields
                                  }
                                  if (deleteFields[f.name])
                                    delete _deletedFields[f.name]
                                  else
                                    _deletedFields[f.name] = true;
                                  setDeleteFields(_deletedFields);
                                }}
                                className='trash-icon'
                                iconName='trash'
                              />
                              </td>
                            </tr>
                          )}
                      </table>
                    </PivotItem>
                    <PivotItem headerText='Table' >
                      <textarea readOnly className={mergeStyles({ minHeight: "10rem", width: "100%", resize: "none" })} value={defs.table} />
                    </PivotItem>
                    <PivotItem headerText='Views' >
                      <textarea readOnly className={mergeStyles({ minHeight: "10rem", width: "100%", resize: "vertical" })} value={Object.keys(defs.views).map((v) => defs.views[v].definition).join("\r\n\r\n")} />
                    </PivotItem>
                    <PivotItem headerText='Interfaces'>
                      <textarea readOnly className={mergeStyles({ minHeight: "10rem", width: "100%", resize: "vertical" })} value={defs.interfaces} />
                    </PivotItem>
                    <PivotItem headerText='Functions' >
                      <textarea readOnly className={mergeStyles({ minHeight: "10rem", width: "100%", resize: "vertical" })} value={defs.functions} />
                    </PivotItem>
                    <PivotItem headerText='APIs'>
                      <textarea readOnly className={mergeStyles({ minHeight: "10rem", width: "100%", resize: "vertical" })} value={defs.api} />
                    </PivotItem>
                    {errors[entity.name] && <PivotItem headerText='Errors'>
                      <textarea readOnly className={mergeStyles({ minHeight: "10rem", width: "100%", resize: "vertical" })} value={
                        errors[entity.name].map(r => `${r.type}|${r.name}|${r.columnname}\r\n-----------------------------------------\r\n\r\n${r.message}\r\n${r.detail}\r\n${r.context}`).join("\r\n\r\n")} />
                    </PivotItem>}
                  </Pivot>
                </div>}
            </div>
            <div className={mergeStyles({ borderLeft: "1px solid white", padding: "0.25rem", order: 2, display: "flex", flexDirection: "column", width: "20%" })} >
              <h2>Entities</h2>
              {
                entities?.map((e) => <a
                  className={mergeStyles({
                    cursor: "pointer",
                    fontSize: "1rem", padding: "0.25rem"
                  }, e.name === entity?.name ? { backgroundColor: "white", color: "black" } : null)}
                  onClick={() => {
                    setEntity(e);
                    e.definition?.fields?.forEach((f) => {
                      if (f.dataType === "timestampz")
                        f.dataType = "timestamptz";
                    });

                    setFields(e.definition?.fields);
                    const v = e.definition?.views?.length ? e.definition?.views : minViews(e.name)
                    setViews(v);
                  }}
                >{e.name}{Boolean(errors[e.name]) && <Icon iconName='AlertSolid' className={mergeStyles({ verticalAlign: "middle", float: "right", color: "gold" })} color='red' title={errors[e.name].map(e => e.name).join(",")} />}</a>)
              }
              <div
                className={mergeStyles({ display: "flex", flexDirection: "row" })}
              ><input
                  placeholder='Add New Entity'
                  value={newEntityName}
                  className={mergeStyles({ flexGrow: 1, marginRight: "0.5rem" })}
                  onChange={(t) => {
                    setNewEntity(ensureSnake(t.currentTarget.value));
                  }}
                />
                <Icon iconName='CircleAdditionSolid'
                  className={mergeStyles({ fontSize: "1.25rem" })}
                  onClick={async () => {
                    setDisableAdd(true);
                    if (newEntityName) {
                      try {
                        await createEntity(newEntityName);
                        setNewEntity("");
                        resetEntities();
                      }
                      catch (ex) {
                        alert(ex);
                      }
                    }
                    setDisableAdd(false)
                  }}
                />
              </div>
              <ActionButton
                onClick={(r) => {
                  createSQLDiff(true).then((result) => {
                    if (result) {
                      const errSet: Record<string, DiffErr[]> = {}

                      result.forEach((e) =>
                        (errSet[e.entityname] || (errSet[e.entityname] = [])).push(e));
                      console.log(errSet);
                      setErrors(errSet);
                    }
                  }).catch((ex) => {
                    alert(ex.message);
                  })
                }}
                style={{ color: "white", marginTop: "1rem" }} iconProps={{ iconName: "TestCase" }} title="">Test Build</ActionButton>
              <ActionButton
                onClick={() => {
                  createSQLDiff().then(() => {
                    alert("SUCCESS")
                  }).catch((ex) => {
                    alert(ex.message);
                  })
                }}
                style={{ color: "white", marginTop: "1rem" }} iconProps={{ iconName: "EditCreate" }} title="">Build Files</ActionButton>
              <ActionButton
                onClick={() => {
                  updateServer().then(() => {
                    alert("UPDATED SERVER!")
                  }).catch((ex) => {
                    alert(ex.message);
                  })
                }}
                style={{ color: "white", marginTop: "1rem" }} iconProps={{ iconName: "Server" }} title="">Update Server</ActionButton>
            </div>
          </div>
        </header>
      </div>
    </ThemeProvider >
  );
}

export default App;
