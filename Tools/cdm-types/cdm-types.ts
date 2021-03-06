import { performance } from "perf_hooks";
import { SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER } from "constants";

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  public interfaces and data structures
//
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
//  shape of persisted json
////////////////////////////////////////////////////////////////////////////////////////////////////

export interface identifierRef
{
    corpusPath: string;
    identifier: string;
}

export interface Argument
{
    explanation?: string;
    name?: string;
    value: any;
}

export interface Parameter
{
    explanation?: string;
    name: string;
    defaultValue?: any;
    required?: boolean;
    direction?: string;
    dataType?: string | DataTypeReference;
}

export interface Import
{
    uri: string;
    moniker?: string;
}

export interface TraitReference
{
    traitReference: string | Trait;
    arguments?: (string | Argument)[];
}

export interface Trait
{
    explanation?: string;
    traitName: string;
    extendsTrait?: string | TraitReference;
    hasParameters?: (string | Parameter)[];
    elevated?: boolean;
    modifiesAttributes?: boolean;
    ugly?: boolean;
    associatedProperties?: string[];
}

export interface RelationshipReference
{
    relationshipReference: string | Relationship;
    appliedTraits?: (string | TraitReference)[];
}

export interface Relationship
{
    explanation?: string;
    relationshipName: string;
    extendsRelationship?: string | RelationshipReference;
    exhibitsTraits?: (string | TraitReference)[];
}

export interface DataTypeReference
{
    dataTypeReference: string | DataType;
    appliedTraits?: (string | TraitReference)[];
}

export interface DataType
{
    explanation?: string;
    dataTypeName: string;
    extendsDataType?: string | DataTypeReference;
    exhibitsTraits?: (string | TraitReference)[];
}

export interface TypeAttribute
{
    explanation?: string;
    name: string;
    relationship?: (string | RelationshipReference);
    dataType?: (string | DataTypeReference);
    appliedTraits?: (string | TraitReference)[];
    isPrimaryKey?: boolean;
    isReadOnly?: boolean;
    isNullable?: boolean;
    dataFormat?: string;
    sourceName?: string;
    sourceOrdering?: number;
    displayName?: string;
    description?: string;
    maximumValue?: string;
    minimumValue?: string;
    maximumLength?: number;
    valueConstrainedToList?: boolean;
    defaultValue?: any;
}

export interface AttributeGroupReference
{
    attributeGroupReference: string | AttributeGroup;
}

export interface AttributeGroup
{
    explanation?: string;
    attributeGroupName: string;
    members: (string | AttributeGroupReference | TypeAttribute | EntityAttribute)[];
    exhibitsTraits?: (string | TraitReference)[];
}

export interface EntityAttribute
{
    explanation?: string;
    relationship?: (string | RelationshipReference);
    entity: (string | EntityReference | (string | EntityReference)[]);
    appliedTraits?: (string | TraitReference)[];
}

export interface ConstantEntity
{
    explanation?: string;
    constantEntityName?: string;
    entityShape: string | EntityReference;
    constantValues: string[][];
}

export interface EntityReference
{
    entityReference: string | Entity;
    appliedTraits?: (string | TraitReference)[];
}

export interface Entity
{
    explanation?: string;
    entityName: string;
    extendsEntity?: string | EntityReference;
    exhibitsTraits?: (string | TraitReference)[];
    hasAttributes?: (string | AttributeGroupReference | TypeAttribute | EntityAttribute)[];
    sourceName?: string;
    displayName?: string;
    description?: string;
    version?: string;
    cdmSchemas?: string[];
}

export interface DocumentContent
{
    schema: string;
    schemaVersion: string;
    imports?: Import[];
    definitions: (Trait | DataType | Relationship | AttributeGroup | Entity | ConstantEntity)[];
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//  enums
////////////////////////////////////////////////////////////////////////////////////////////////////
export enum cdmObjectType
{
    error,
    import,
    argumentDef,
    parameterDef,
    traitDef,
    traitRef,
    relationshipDef,
    relationshipRef,
    dataTypeDef,
    dataTypeRef,
    attributeRef,
    typeAttributeDef,
    entityAttributeDef,
    attributeGroupDef,
    attributeGroupRef,
    constantEntityDef,
    entityDef,
    entityRef,
    documentDef,
    folderDef
}

export enum cdmTraitSet
{
    all,
    elevatedOnly,
    inheritedOnly,
    appliedOnly
}

export enum cdmValidationStep
{
    start,
    imports,
    integrity,
    declarations,
    references,
    parameters,
    traits,
    attributes,
    entityReferences,
    finished,
    error
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//  interfaces for construction, inspection of OM
////////////////////////////////////////////////////////////////////////////////////////////////////

export interface ICdmObject
{
    ID : number;
    visit(path : string, preChildren: VisitCallback, postChildren: VisitCallback): boolean;
    validate(): boolean;
    getObjectType(): cdmObjectType;
    objectType: cdmObjectType;
    getObjectDef<T=ICdmObjectDef>(wrtDoc : ICdmDocumentDef): T
    getObjectDefName(): string;
    copyData(wrtDoc : ICdmDocumentDef, stringPaths?: boolean): any;
    getResolvedTraits(wrtDoc : ICdmDocumentDef, set?: cdmTraitSet): ResolvedTraitSet
    setTraitParameterValue(wrtDoc : ICdmDocumentDef, toTrait: ICdmTraitDef, paramName: string, value: ArgumentValue);
    getResolvedAttributes(wrtDoc : ICdmDocumentDef): ResolvedAttributeSet
    copy(wrtDoc : ICdmDocumentDef);
    getFriendlyFormat(): friendlyFormatNode;
}

export interface ICdmObjectRef extends ICdmObject
{
    getAppliedTraitRefs(): ICdmTraitRef[];
    addAppliedTrait(traitDef: ICdmTraitRef | ICdmTraitDef | string, implicitRef: boolean): ICdmTraitRef;
    removeAppliedTrait(traitDef: ICdmTraitRef | ICdmTraitDef | string);
    setObjectDef(def: ICdmObjectDef): ICdmObjectDef;
}

export interface ICdmReferencesEntities
{
    getResolvedEntityReferences(wrtDoc : ICdmDocumentDef): ResolvedEntityReferenceSet;
}

export interface ICdmArgumentDef extends ICdmObject
{
    getExplanation(): string;
    setExplanation(explanation: string): string;
    getValue(): ArgumentValue;
    getName(): string;
    getParameterDef(): ICdmParameterDef;
    setValue(value: ArgumentValue);
}

export interface ICdmParameterDef extends ICdmObject
{
    getExplanation(): string;
    getName(): string;
    getDefaultValue(): ArgumentValue;
    getRequired(): boolean;
    getDirection(): string;
    getDataTypeRef(): ICdmDataTypeRef;
}

export interface ICdmTraitRef extends ICdmObjectRef
{
    getArgumentDefs(): (ICdmArgumentDef)[];
    addArgument(name: string, value: ArgumentValue): ICdmArgumentDef;
    setArgumentValue(name: string, value: ArgumentValue);
    getArgumentValue(name: string): ArgumentValue;
}

export interface ICdmObjectDef extends ICdmObject
{
    getExplanation(): string;
    setExplanation(explanation: string): string;
    getName(): string;
    getExhibitedTraitRefs(): ICdmTraitRef[];
    addExhibitedTrait(traitDef: ICdmTraitRef | ICdmTraitDef | string, implicitRef: boolean): ICdmTraitRef;
    removeExhibitedTrait(traitDef: ICdmTraitRef | ICdmTraitDef | string);
    isDerivedFrom(wrtDoc : ICdmDocumentDef, base: string): boolean;
    getObjectPath(): string;
}

export interface ICdmTraitDef extends ICdmObjectDef
{
    getExtendsTrait(): ICdmTraitRef;
    setExtendsTrait(traitDef: ICdmTraitRef | ICdmTraitDef | string, implicitRef: boolean): ICdmTraitRef;
    getHasParameterDefs(): ICdmParameterDef[];
    getAllParameters(wrtDoc: ICdmDocumentDef): ParameterCollection;
    addTraitApplier(applier: traitApplier);
    getTraitAppliers(): traitApplier[];
    elevated: boolean;
    modifiesAttributes: boolean;
    ugly: boolean;
    associatedProperties: string[];
}

export interface ICdmRelationshipRef extends ICdmObjectRef
{
}

export interface ICdmRelationshipDef extends ICdmObjectDef
{
    getExtendsRelationshipRef(): ICdmRelationshipRef;
}

export interface ICdmDataTypeRef extends ICdmObjectRef
{
}

export interface ICdmDataTypeDef extends ICdmObjectDef
{
    getExtendsDataTypeRef(): ICdmDataTypeRef;
}

export interface ICdmAttributeDef extends ICdmObjectRef, ICdmReferencesEntities
{
    getExplanation(): string;
    setExplanation(explanation: string): string;
    getName(): string;
    getRelationshipRef(): ICdmRelationshipRef;
    setRelationshipRef(relRef: ICdmRelationshipRef): ICdmRelationshipRef;
    removeTraitDef(wrtDoc: ICdmDocumentDef, ref: ICdmTraitDef);
}

export interface ICdmTypeAttributeDef extends ICdmAttributeDef
{
    getDataTypeRef(): ICdmDataTypeRef;
    setDataTypeRef(dataType: ICdmDataTypeRef): ICdmDataTypeRef;
    isPrimaryKey: boolean;    
    isReadOnly: boolean;
    isNullable: boolean;
    dataFormat: string;
    sourceName: string;
    sourceOrdering: number;
    displayName: string;
    description: string;
    maximumValue: string;
    minimumValue: string;
    maximumLength: number;
    valueConstrainedToList: boolean;
    defaultValue: any;
}

export interface ICdmAttributeGroupRef extends ICdmObjectRef, ICdmReferencesEntities
{
}

export interface ICdmAttributeGroupDef extends ICdmObjectDef, ICdmReferencesEntities
{
    getMembersAttributeDefs(): (ICdmAttributeGroupRef | ICdmTypeAttributeDef | ICdmEntityAttributeDef)[];
    addMemberAttributeDef(attDef: ICdmAttributeGroupRef | ICdmTypeAttributeDef | ICdmEntityAttributeDef): ICdmAttributeGroupRef | ICdmTypeAttributeDef | ICdmEntityAttributeDef;
}

export interface ICdmEntityAttributeDef extends ICdmAttributeDef
{
    getEntityRefIsArray(): boolean;
    getEntityRef(): (ICdmEntityRef | (ICdmEntityRef[]));
    setEntityRef(entRef: (ICdmEntityRef | (ICdmEntityRef[]))): (ICdmEntityRef | (ICdmEntityRef[]));
}

export interface ICdmConstantEntityDef extends ICdmObjectDef
{
    getEntityShape(): ICdmEntityRef;
    setEntityShape(shape: ICdmEntityRef): ICdmEntityRef;
    getConstantValues(): string[][];
    setConstantValues(values: string[][]): string[][];
    lookupWhere(wrtDoc:ICdmDocumentDef, attReturn: string | number, attSearch: string | number, valueSearch: string): string;
    setWhere(wrtDoc:ICdmDocumentDef, attReturn: string | number, newValue: string, attSearch: string | number, valueSearch: string): string;
}

export interface ICdmEntityRef extends ICdmObjectRef
{
}

export interface ICdmEntityDef extends ICdmObjectDef, ICdmReferencesEntities
{
    getExtendsEntityRef(): ICdmObjectRef;
    setExtendsEntityRef(ref: ICdmObjectRef): ICdmObjectRef;
    getHasAttributeDefs(): (ICdmAttributeGroupRef | ICdmTypeAttributeDef | ICdmEntityAttributeDef)[];
    addAttributeDef(attDef: ICdmAttributeGroupRef | ICdmTypeAttributeDef | ICdmEntityAttributeDef): ICdmAttributeGroupRef | ICdmTypeAttributeDef | ICdmEntityAttributeDef;
    countInheritedAttributes(wrtDoc : ICdmDocumentDef): number;
    getAttributesWithTraits(wrtDoc : ICdmDocumentDef, queryFor: TraitSpec | TraitSpec[]): ResolvedAttributeSet;
    getResolvedEntity(wrtDoc : ICdmDocumentDef) : ResolvedEntity;
    sourceName: string;
    displayName: string;
    description: string;
    version: string;
    cdmSchemas: string[];
    declaredInDocument: ICdmDocumentDef;
}

export interface ICdmImport extends ICdmObject
{
    uri: string;
    moniker?: string;
}

export interface ICdmDocumentDef extends ICdmObject
{
    getName(): string;
    setName(name: string): string;
    getSchema(): string;
    getSchemaVersion(): string;
    getDefinitions(): (ICdmTraitDef | ICdmDataTypeDef | ICdmRelationshipDef | ICdmAttributeGroupDef | ICdmEntityDef | ICdmConstantEntityDef)[];
    addDefinition<T>(ofType: cdmObjectType, name: string): T;
    getImports(): ICdmImport[];
    addImport(uri: string, moniker: string): void;
    getObjectFromDocumentPath(path: string): ICdmObject;
}

export interface ICdmFolderDef extends ICdmObject
{
    getName(): string;
    getRelativePath(): string;
    getSubFolders(): ICdmFolderDef[];
    getDocuments(): ICdmDocumentDef[];
    addFolder(name: string): ICdmFolderDef
    addDocument(name: string, content: string): ICdmDocumentDef;
    getSubFolderFromPath(path: string, makeFolder: boolean): ICdmFolderDef;
    getObjectFromFolderPath(path: string): ICdmObject;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//  argument types and callbacks
////////////////////////////////////////////////////////////////////////////////////////////////////
export interface TraitParamSpec
{
    traitBaseName: string;
    params: {
        paramName: string;
        paramValue: string;
    }[];
}
export type TraitSpec = (string | TraitParamSpec);

export type ArgumentValue = (string | ICdmObject);


export enum cdmStatusLevel
{
    info,
    progress,
    warning,
    error
}
export type RptCallback = (level: cdmStatusLevel, msg: string, path: string) => void;
export type VisitCallback = (iObject: ICdmObject, path: string) => boolean

type CdmCreator<T> = (o: any) => T;


export interface ApplierResult
{
    shouldDelete?: boolean;            // for attributeRemove, set to true to request that attribute be removed
    continuationState?: any;            // set to any value to request another call to the same method. values will be passed back in 
    addedAttribute?: ICdmAttributeDef;  // result of adding. 
}
export interface traitApplier
{
    matchName: string;
    priority: number;
    willApply?: (wrtDoc: ICdmDocumentDef, resAtt: ResolvedAttribute, resTrait: ResolvedTrait) => boolean;
    attributeApply?: (wrtDoc: ICdmDocumentDef, resAtt: ResolvedAttribute, resTrait: ResolvedTrait) => ApplierResult;
    willAdd?: (wrtDoc: ICdmDocumentDef, resAtt: ResolvedAttribute, resTrait: ResolvedTrait, continuationState: any) => boolean;
    attributeAdd?: (wrtDoc: ICdmDocumentDef, resAtt: ResolvedAttribute, resTrait: ResolvedTrait, continuationState: any) => ApplierResult;
    attributeRemove?: (wrtDoc: ICdmDocumentDef, resAtt: ResolvedAttribute, resTrait: ResolvedTrait) => ApplierResult;
}
interface ApplierContinuation
{
    applier: traitApplier;
    resAtt: ResolvedAttribute;
    resTrait: ResolvedTrait;
    continuationState: any;
}
class ApplierContinuationSet
{
    constructor()
    {
        //let bodyCode = () =>
        {
            this.continuations = new Array<ApplierContinuation>();
        }
        //return p.measure(bodyCode);
    }
    continuations: ApplierContinuation[];
    rasResult: ResolvedAttributeSet;
}

interface callData
{
    calls: number;
    timeTotal: number;
    timeExl: number;
}

class profile
{
    calls: Map<string, callData> = new Map<string, callData>();
    callStack: Array<string> = new Array<string>();

    public measure(code: () => any): any
    {
        let stack: string = new Error().stack;
        let start = stack.indexOf(" at ", 13) + 4;
        let end = stack.indexOf("(", start);
        let loc = stack.slice(start, end);
        start = stack.indexOf("js:", end) + 3;
        end = stack.indexOf(":", start);
        loc += ":" + stack.slice(start, end);

        this.callStack.push(loc);

        let cnt = this.calls.get(loc);
        if (!cnt) {
            cnt = { calls: 0, timeTotal: 0, timeExl: 0 };
            this.calls.set(loc, cnt);
        }
        cnt.calls++;
        let n = performance.now();
        let retVal = code();
        let elaspsed = performance.now() - n;
        if (elaspsed < 0)
            elaspsed = .00001;
        cnt.timeTotal += elaspsed;

        this.callStack.pop();

        if (this.callStack.length) {
            let locFrom = this.callStack[this.callStack.length - 1];
            cnt = this.calls.get(locFrom);
            cnt.timeExl += elaspsed;
        }

        return retVal;
    }

    public report()
    {
        //let s = new Map([...this.calls.entries()].sort((a, b) => by == 0 ? (b[1].calls - a[1].calls) : (by == 1 ? (b[1].timeTotal - a[1].timeTotal))));
        this.calls.forEach((v, k) =>
        {
            console.log(`${v.calls},${v.timeTotal},${v.timeTotal - v.timeExl},${k}`)
        });
    }

}

let p = new profile();

let visits: Map<string, number>;
function trackVisits(path)
{
    if (!visits)
        visits = new Map<string, number>();
    let cnt = 0;
    if (visits.has(path)) {
        cnt = visits.get(path) + 1;
    }
    visits.set(path, cnt);
    if (path == "Case/hasAttributes/attributesAddedAtThisScope/members/(unspecified)")
        return true;
}



////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  classes for resolution of refereneces and representing constructed traits, attributes and relationships
//
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
//  parameters and arguments in traits
////////////////////////////////////////////////////////////////////////////////////////////////////

export class ParameterCollection
{
    sequence: ICdmParameterDef[];
    lookup: Map<string, ICdmParameterDef>;
    ordinals: Map<ICdmParameterDef, number>;
    constructor(prior: ParameterCollection)
    {
        //let bodyCode = () =>
        {
            if (prior && prior.sequence)
                this.sequence = prior.sequence.slice();
            else
                this.sequence = new Array<ICdmParameterDef>();

            if (prior && prior.lookup)
                this.lookup = new Map<string, ICdmParameterDef>(prior.lookup);
            else
                this.lookup = new Map<string, ICdmParameterDef>();

            if (prior && prior.ordinals)
                this.ordinals = new Map<ICdmParameterDef, number>(prior.ordinals);
            else
                this.ordinals = new Map<ICdmParameterDef, number>();
        }
        //return p.measure(bodyCode);
    }

    public add(element: ICdmParameterDef)
    {
        //let bodyCode = () =>
        {
            // if there is already a named parameter that matches, this is trouble
            let name: string = element.getName();
            if (name && this.lookup.has(name))
                throw new Error(`duplicate parameter named '${name}'`)
            if (name)
                this.lookup.set(name, element);

            this.ordinals.set(element, this.sequence.length);
            this.sequence.push(element);
        }
        //return p.measure(bodyCode);
    }
    public resolveParameter(ordinal: number, name: string)
    {
        //let bodyCode = () =>
        {
            if (name) {
                if (this.lookup.has(name))
                    return this.lookup.get(name);
                throw new Error(`there is no parameter named '${name}'`)
            }
            if (ordinal >= this.sequence.length)
                throw new Error(`too many arguments supplied`)
            return this.sequence[ordinal];
        }
        //return p.measure(bodyCode);
    }
    public getParameterIndex(pName: string): number
    {
        //let bodyCode = () =>
        {
            return this.ordinals.get(this.lookup.get(pName));
        }
        //return p.measure(bodyCode);
    }
}

export class ParameterValue
{
    public parameter: ICdmParameterDef;
    public value: ArgumentValue;
    constructor(param: ICdmParameterDef, value: ArgumentValue)
    {
        //let bodyCode = () =>
        {
            this.parameter = param;
            this.value = value;
        }
        //return p.measure(bodyCode);
    }
    public getValueString(wrtDoc : ICdmDocumentDef): string
    {
        //let bodyCode = () =>
        {
            if (typeof(this.value) === "string")
                return this.value;
            let value = this.value as ICdmObject;
            if (value) {
                // if this is a constant table, then expand into an html table
                let def = value.getObjectDef(wrtDoc);
                if (value.getObjectType() == cdmObjectType.entityRef && def && def.getObjectType() == cdmObjectType.constantEntityDef) {
                    var entShape = (def as ICdmConstantEntityDef).getEntityShape();
                    var entValues = (def as ICdmConstantEntityDef).getConstantValues();
                    if (!entValues && entValues.length == 0)
                        return "";

                    let rows = new Array<any>();
                    var shapeAtts = entShape.getResolvedAttributes(wrtDoc);
                    let l = shapeAtts.set.length;

                    for (var r = 0; r < entValues.length; r++) {
                        var rowData = entValues[r];
                        if (rowData && rowData.length) {
                            let row = {};
                            for (var c = 0; c < rowData.length; c++) {
                                var tvalue = rowData[c];
                                row[shapeAtts.set[c].resolvedName] = tvalue;
                            }
                            rows.push(row);
                        }
                    }
                    return JSON.stringify(rows);
                }
                // should be a reference to an object
                let data = value.copyData(wrtDoc, false);
                if (typeof(data === "string"))
                    return data;

                return JSON.stringify(data);
            }
            return "";
        }
        //return p.measure(bodyCode);
    }
    public get name(): string
    {
        //let bodyCode = () =>
        {
            return this.parameter.getName();
        }
        //return p.measure(bodyCode);
    }
    public setValue(wrtDoc : ICdmDocumentDef, newValue: ArgumentValue)
    {
        //let bodyCode = () =>
        {
            this.value = ParameterValue.getReplacementValue(wrtDoc, this.value, newValue);
        }
        //return p.measure(bodyCode);
    }
    public static getReplacementValue(wrtDoc : ICdmDocumentDef, oldValue: ArgumentValue, newValue: ArgumentValue): ArgumentValue
    {
        //let bodyCode = () =>
        {
            if (!oldValue)
                return newValue;
            if (typeof(oldValue) == "string")
                return newValue;
            let ov = oldValue as ICdmObject;
            let nv = newValue as ICdmObject;
            // replace an old table with a new table? actually just mash them together
            if (ov && ov.getObjectType() == cdmObjectType.entityRef && 
                nv && typeof(nv) != "string" && nv.getObjectType() == cdmObjectType.entityRef) {
                let oldEnt: ICdmConstantEntityDef = ov.getObjectDef(wrtDoc);
                let newEnt: ICdmConstantEntityDef = nv.getObjectDef(wrtDoc);

                // check that the entities are the same shape
                if (!newEnt)
                    return ov;
                if (!oldEnt || (oldEnt.getEntityShape() != oldEnt.getEntityShape()))
                    return nv;

                let oldCv = oldEnt.getConstantValues();
                let newCv = newEnt.getConstantValues();
                // rows in old?
                if (!oldCv || oldCv.length == 0)
                    return nv;
                // rows in new?
                if (!newCv || newCv.length == 0)
                    return ov;

                // find rows in the new one that are not in the old one. slow, but these are small usually
                let appendedRows = new Array<Array<string>>();
                let lNew = newCv.length;
                let lOld = oldCv.length;
                for (let iNew = 0; iNew < lNew; iNew++) {
                    let newRow = newCv[iNew];
                    let lCol = newRow.length;
                    let iOld = 0
                    for (; iOld < lOld; iOld++) {
                        let oldRow = oldCv[iOld];
                        let iCol = 0
                        for (; iCol < lCol; iCol++) {
                            if (newRow[iCol] != oldRow[iCol])
                                break;
                        }
                        if (iCol < lCol)
                            break;
                    }
                    if (iOld < lOld) {
                        appendedRows.push(newRow);
                    }
                }

                if (!appendedRows.length)
                    return nv;

                let replacementEnt: ICdmConstantEntityDef = oldEnt.copy(wrtDoc);
                let allRows = replacementEnt.getConstantValues().slice(0).concat(appendedRows);
                replacementEnt.setConstantValues(allRows);
                return Corpus.MakeRef(cdmObjectType.entityRef, replacementEnt, false);
            }

            return newValue;
        }
        //return p.measure(bodyCode);
    }
    public spew(indent: string)
    {
        //let bodyCode = () =>
        {
            console.log(`${indent}${this.name}:${this.getValueString(null)}`);
        }
        //return p.measure(bodyCode);
    }

}

export class ParameterValueSet
{
    pc: ParameterCollection;
    values: ArgumentValue[];
    constructor(pc: ParameterCollection, values: ArgumentValue[])
    {
        //let bodyCode = () =>
        {
            this.pc = pc;
            this.values = values;
        }
        //return p.measure(bodyCode);
    }
    public get length(): number
    {
        //let bodyCode = () =>
        {
            if (this.pc && this.pc.sequence)
                return this.pc.sequence.length;
            return 0;
        }
        //return p.measure(bodyCode);
    }
    public indexOf(paramDef: ICdmParameterDef): number
    {
        //let bodyCode = () =>
        {
            return this.pc.ordinals.get(paramDef);
        }
        //return p.measure(bodyCode);
    }
    public getParameter(i: number): ICdmParameterDef
    {
        //let bodyCode = () =>
        {
            return this.pc.sequence[i];
        }
        //return p.measure(bodyCode);
    }
    public getValue(i: number): ArgumentValue
    {
        //let bodyCode = () =>
        {
            return this.values[i];
        }
        //return p.measure(bodyCode);
    }
    public getValueString(wrtDoc : ICdmDocumentDef, i: number): string
    {
        //let bodyCode = () =>
        {
            return new ParameterValue(this.pc.sequence[i], this.values[i]).getValueString(wrtDoc);
        }
        //return p.measure(bodyCode);        
    }
    public getParameterValue(pName: string): ParameterValue
    {
        //let bodyCode = () =>
        {
            let i = this.pc.getParameterIndex(pName);
            return new ParameterValue(this.pc.sequence[i], this.values[i])
        }
        //return p.measure(bodyCode);
    }

    public setParameterValue(wrtDoc : ICdmDocumentDef, pName: string, value: ArgumentValue): void
    {
        //let bodyCode = () =>
        {
            let i = this.pc.getParameterIndex(pName);
            this.values[i] = ParameterValue.getReplacementValue(wrtDoc, this.values[i], value);
        }
        //return p.measure(bodyCode);
    }

    public copy(): ParameterValueSet
    {
        //let bodyCode = () =>
        {
            let copyValues = this.values.slice(0);
            let copy = new ParameterValueSet(this.pc, copyValues);
            return copy;
        }
        //return p.measure(bodyCode);
    }

    public spew(indent: string)
    {
        //let bodyCode = () =>
        {
            let l = this.length;
            for (let i = 0; i < l; i++) {
                let pv = new ParameterValue(this.pc.sequence[i], this.values[i]);
                pv.spew(indent + '-');
            }
        }
        //return p.measure(bodyCode);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//  resolved traits
////////////////////////////////////////////////////////////////////////////////////////////////////

export class ResolvedTrait
{
    public trait: ICdmTraitDef;
    public parameterValues: ParameterValueSet;
    constructor(trait: ICdmTraitDef, pc: ParameterCollection, values: ArgumentValue[])
    {
        //let bodyCode = () =>
        {
            this.parameterValues = new ParameterValueSet(pc, values);
            this.trait = trait;
        }
        //return p.measure(bodyCode);
    }
    public get traitName(): string
    {
        //let bodyCode = () =>
        {
            return this.trait.getName();
        }
        //return p.measure(bodyCode);
    }
    public spew(indent: string)
    {
        //let bodyCode = () =>
        {
            console.log(`${indent}[${this.traitName}]`);
            this.parameterValues.spew(indent + '-');
        }
        //return p.measure(bodyCode);
    }
    public copy(): ResolvedTrait
    {
        //let bodyCode = () =>
        {
            let copyParamValues = this.parameterValues.copy();
            let copy = new ResolvedTrait(this.trait, copyParamValues.pc, copyParamValues.values);
            return copy;
        }
        //return p.measure(bodyCode);
    }
    public collectTraitNames(wrtDoc : ICdmDocumentDef, into: Set<string>)
    {
        //let bodyCode = () =>
        {
            // get the name of this trait and all of its base classes
            let t = this.trait;
            while (t) {
                let name = t.getName();
                if (!into.has(name))
                    into.add(name);
                let baseRef = t.getExtendsTrait();
                t = baseRef ? baseRef.getObjectDef(wrtDoc) : null;
            }
        }
        //return p.measure(bodyCode);
    }
}

class refCounted
{
    public refCnt: number;
    constructor()
    {
        //let bodyCode = () =>
        {
            this.refCnt = 0;
        }
        //return p.measure(bodyCode);
    }
    addRef()
    {
        //let bodyCode = () =>
        {
            this.refCnt++;
        }
        //return p.measure(bodyCode);
    }
    release()
    {
        //let bodyCode = () =>
        {
            this.refCnt--;
        }
        //return p.measure(bodyCode);
    }
}

export class ResolvedTraitSet extends refCounted
{
    public set: ResolvedTrait[];
    private lookupByTrait: Map<ICdmTraitDef, ResolvedTrait>;
    wrtDoc : ICdmDocumentDef;
    constructor(wrtDoc : ICdmDocumentDef)
    {
        super();
        //let bodyCode = () =>
        {
            this.wrtDoc = wrtDoc;
            this.set = new Array<ResolvedTrait>();
            this.lookupByTrait = new Map<ICdmTraitDef, ResolvedTrait>();
        }
        //return p.measure(bodyCode);
    }
    public merge(toMerge: ResolvedTrait, copyOnWrite: boolean, forAtt: ICdmAttributeDef = null): ResolvedTraitSet
    {
        //let bodyCode = () =>
        {
            let traitSetResult: ResolvedTraitSet = this;
            let trait: ICdmTraitDef = toMerge.trait;
            let av: ArgumentValue[] = toMerge.parameterValues.values;
            if (traitSetResult.lookupByTrait.has(trait)) {
                let rtOld = traitSetResult.lookupByTrait.get(trait);
                let avOld = rtOld.parameterValues.values;
                // the new values take precedence
                let l = av.length;
                for (let i = 0; i < l; i++) {
                    if (av[i] != avOld[i]) {
                        if (traitSetResult === this && copyOnWrite) {
                            traitSetResult = traitSetResult.shallowCopyWithException(trait); // copy on write
                            rtOld = traitSetResult.lookupByTrait.get(trait);
                            avOld = rtOld.parameterValues.values;
                        }
                        avOld[i] = ParameterValue.getReplacementValue(this.wrtDoc, avOld[i], av[i]);
                    }
                    if (forAtt) {
                        let arThis = avOld[i] as AttributeReferenceImpl;
                        if (arThis && arThis.isAmbiguousButDifferentFrom && arThis.isAmbiguousButDifferentFrom(this.wrtDoc, forAtt)) {
                            if (traitSetResult === this && copyOnWrite) {
                                traitSetResult = traitSetResult.shallowCopyWithException(trait); // copy on write
                                rtOld = traitSetResult.lookupByTrait.get(trait);
                                avOld = rtOld.parameterValues.values;
                            }
                            avOld[i] = ParameterValue.getReplacementValue(this.wrtDoc, avOld[i], forAtt);
                        }
                    }
                }
            }
            else {
                if (this.refCnt > 1)
                    traitSetResult = traitSetResult.shallowCopy(); // copy on write
                toMerge = toMerge.copy();
                traitSetResult.set.push(toMerge);
                traitSetResult.lookupByTrait.set(trait, toMerge);

                if (forAtt) {
                    let avMerge = toMerge.parameterValues.values;
                    let l = av.length;
                    for (let i = 0; i < l; i++) {
                        let arThis = avMerge[i] as AttributeReferenceImpl;
                        if (arThis && arThis.isAmbiguousButDifferentFrom && arThis.isAmbiguousButDifferentFrom(this.wrtDoc, forAtt)) {
                            // never change the values in the trait passed in.
                            traitSetResult = traitSetResult.shallowCopyWithException(trait); // copy on write
                            let rtOld = traitSetResult.lookupByTrait.get(trait);
                            avMerge = rtOld.parameterValues.values;
                            avMerge[i] = forAtt;
                        }
                    }

                }
            }

            return traitSetResult;

        }
        //return p.measure(bodyCode);
    }

    public mergeWillAlter(toMerge: ResolvedTrait, forAtt: ICdmAttributeDef = null): boolean
    {
        //let bodyCode = () =>
        {
            let trait: ICdmTraitDef = toMerge.trait;
            if (!this.lookupByTrait.has(trait))
                return true;
            let pc: ParameterCollection = toMerge.parameterValues.pc;
            let av: ArgumentValue[] = toMerge.parameterValues.values;
            let rtOld = this.lookupByTrait.get(trait);
            let avOld = rtOld.parameterValues.values;
            let l = av.length;
            for (let i = 0; i < l; i++) {
                if (av[i] != avOld[i])
                    return true;
                if (forAtt) {
                    let arThis = av[i] as AttributeReferenceImpl;
                    if (arThis && arThis.isAmbiguousButDifferentFrom && arThis.isAmbiguousButDifferentFrom(this.wrtDoc, forAtt))
                        return true;
                }
            }
            return false;
        }
        //return p.measure(bodyCode);
    }


    public mergeSet(toMerge: ResolvedTraitSet, forAtt: ICdmAttributeDef = null): ResolvedTraitSet
    {
        //let bodyCode = () =>
        {
            let traitSetResult: ResolvedTraitSet = this;
            if (toMerge) {
                let l = toMerge.set.length;
                for (let i = 0; i < l; i++) {
                    const rt = toMerge.set[i];
                    let traitSetMerge = traitSetResult.merge(rt, this.refCnt > 1, forAtt);
                    if (traitSetMerge !== traitSetResult) {
                        traitSetResult = traitSetMerge
                    }

                }
            }
            return traitSetResult;
        }
        //return p.measure(bodyCode);
    }

    public mergeSetWillAlter(toMerge: ResolvedTraitSet, forAtt: ICdmAttributeDef = null): boolean
    {
        //let bodyCode = () =>
        {
            let traitSetResult: ResolvedTraitSet = this;
            if (toMerge) {
                let l = toMerge.set.length;
                for (let i = 0; i < l; i++) {
                    const rt = toMerge.set[i];
                    if (traitSetResult.mergeWillAlter(rt, forAtt))
                        return true;
                }
            }
            return false;
        }
        //return p.measure(bodyCode);
    }


    public get(trait: ICdmTraitDef): ResolvedTrait
    {
        //let bodyCode = () =>
        {
            if (this.lookupByTrait.has(trait))
                return this.lookupByTrait.get(trait);
            return null;
        }
        //return p.measure(bodyCode);
    }

    public find(wrtDoc : ICdmDocumentDef, traitName: string): ResolvedTrait
    {
        //let bodyCode = () =>
        {
            let l = this.set.length;
            for (let i = 0; i < l; i++) {
                const rt = this.set[i];
                if (rt.trait.isDerivedFrom(wrtDoc, traitName))
                    return rt;
            }
            return null;
        }
        //return p.measure(bodyCode);
    }

    public get size(): number
    {
        //let bodyCode = () =>
        {
            if (this.set)
                return this.set.length;
            return 0;
        }
        //return p.measure(bodyCode);
    }
    public get first(): ResolvedTrait
    {
        //let bodyCode = () =>
        {
            if (this.set)
                return this.set[0];
            return null;

        }
        //return p.measure(bodyCode);
    }
    public shallowCopyWithException(just: ICdmTraitDef): ResolvedTraitSet
    {
        //let bodyCode = () =>
        {
            let copy = new ResolvedTraitSet(this.wrtDoc);
            let newSet = copy.set;
            let l = this.set.length;
            for (let i = 0; i < l; i++) {
                let rt = this.set[i];
                if (rt.trait == just)
                    rt = rt.copy();
                newSet.push(rt);
                copy.lookupByTrait.set(rt.trait, rt);
            }
            return copy;
        }
        //return p.measure(bodyCode);
    }
    public shallowCopy(): ResolvedTraitSet
    {
        //let bodyCode = () =>
        {
            let copy = new ResolvedTraitSet(this.wrtDoc);
            if (this.set) {
                let newSet = copy.set;
                let l = this.set.length;
                for (let i = 0; i < l; i++) {
                    let rt = this.set[i];
                    newSet.push(rt);
                    copy.lookupByTrait.set(rt.trait, rt);
                }
            }
            return copy;
        }
        //return p.measure(bodyCode);
    }

    public collectTraitNames(): Set<string>
    {
        //let bodyCode = () =>
        {
            let collection = new Set<string>();
            if (this.set) {
                let l = this.set.length;
                for (let i = 0; i < l; i++) {
                    let rt = this.set[i];
                    rt.collectTraitNames(this.wrtDoc, collection);
                }
            }
            return collection;
        }
        //return p.measure(bodyCode);
    }

    public keepElevated(): ResolvedTraitSet
    {
        //let bodyCode = () =>
        {
            let elevatedSet: ResolvedTrait[];
            let elevatedLookup: Map<ICdmTraitDef, ResolvedTrait>;
            let result: ResolvedTraitSet;
            if (this.refCnt > 1) {
                result = new ResolvedTraitSet(this.wrtDoc);
                elevatedSet = result.set;
                elevatedLookup = result.lookupByTrait;
            }
            else {
                result = this;
                elevatedSet = new Array<ResolvedTrait>();
                elevatedLookup = new Map<ICdmTraitDef, ResolvedTrait>();
            }
            let l = this.set.length;
            for (let i = 0; i < l; i++) {
                const rt = this.set[i];
                if (rt.trait.elevated) {
                    elevatedSet.push(rt);
                    elevatedLookup.set(rt.trait, rt);
                }
            }
            result.set = elevatedSet;
            result.lookupByTrait = elevatedLookup;
            return result;
        }
        //return p.measure(bodyCode);
    }

    public setTraitParameterValue(wrtDoc : ICdmDocumentDef, toTrait: ICdmTraitDef, paramName: string, value: ArgumentValue): ResolvedTraitSet
    {
        //let bodyCode = () =>
        {
            let altered: ResolvedTraitSet = this;
            //if (altered.refCnt > 1) {
            altered = this.shallowCopyWithException(toTrait);
            //}

            altered.get(toTrait).parameterValues.setParameterValue(this.wrtDoc, paramName, value);
            return altered;
        }
        //return p.measure(bodyCode);
    }

    public spew(indent: string)
    {
        //let bodyCode = () =>
        {
            let l = this.set.length;
            for (let i = 0; i < l; i++) {
                this.set[i].spew(indent);
            };
        }
        //return p.measure(bodyCode);
    }
}

class ResolvedTraitSetBuilder
{
    public rts: ResolvedTraitSet;
    public set: cdmTraitSet;
    wrtDoc : ICdmDocumentDef;

    constructor(wrtDoc : ICdmDocumentDef, set: cdmTraitSet)
    {
        //let bodyCode = () =>
        {
            this.wrtDoc = wrtDoc;
            this.set = set;
        }
        //return p.measure(bodyCode);
    }
    public clear()
    {
        //let bodyCode = () =>
        {
            if (this.rts) {
                this.rts.release();
                this.rts = null;
            }
        }
        //return p.measure(bodyCode);
    }
    public mergeTraits(rtsNew: ResolvedTraitSet, forAtt: ICdmAttributeDef = null)
    {
        //let bodyCode = () =>
        {
            if (rtsNew) {
                if (!this.rts) {
                    if (forAtt) {
                        // need to run the mergeset code, even though nothing to merge. it sets the att
                        this.takeReference(new ResolvedTraitSet(this.wrtDoc));
                        this.takeReference(this.rts.mergeSet(rtsNew, forAtt));
                    }
                    else
                        this.takeReference(rtsNew);
                }
                else
                    this.takeReference(this.rts.mergeSet(rtsNew, forAtt));
            }
        }
        //return p.measure(bodyCode);
    }
    public takeReference(rtsNew: ResolvedTraitSet)
    {
        //let bodyCode = () =>
        {
            if (this.rts !== rtsNew) {
                if (rtsNew)
                    rtsNew.addRef();
                if (this.rts)
                    this.rts.release();
                this.rts = rtsNew;
            }
        }
        //return p.measure(bodyCode);
    }

    public ownOne(rt: ResolvedTrait)
    {
        //let bodyCode = () =>
        {
            this.takeReference(new ResolvedTraitSet(this.wrtDoc));
            this.rts.merge(rt, false);
        }
        //return p.measure(bodyCode);
    }

    public setParameterValueFromArgument(trait: ICdmTraitDef, arg: ICdmArgumentDef)
    {
        //let bodyCode = () =>
        {

            if (this.rts) {
                let resTrait = this.rts.get(trait);
                if (resTrait) {
                    let av = resTrait.parameterValues.values;
                    let newVal = arg.getValue();
                    // get the value index from the parameter collection given the parameter that this argument is setting
                    let iParam = resTrait.parameterValues.indexOf(arg.getParameterDef());
                    if (this.rts.refCnt > 1 && av[iParam] != newVal) {
                        // make a copy and try again
                        this.takeReference(this.rts.shallowCopyWithException(trait));
                        resTrait = this.rts.get(trait);
                        av = resTrait.parameterValues.values;
                    }
                    av[iParam] = ParameterValue.getReplacementValue(this.wrtDoc, av[iParam], newVal);

                }
            }
        }
        //return p.measure(bodyCode);
    }
    public setTraitParameterValue(wrtDoc : ICdmDocumentDef, toTrait: ICdmTraitDef, paramName: string, value: ArgumentValue)
    {
        //let bodyCode = () =>
        {
            this.takeReference(this.rts.setTraitParameterValue(wrtDoc, toTrait, paramName, value));
        }
        //return p.measure(bodyCode);
    }

    public cleanUp()
    {
        //let bodyCode = () =>
        {
            if (this.rts && this.set == cdmTraitSet.elevatedOnly) {
                this.takeReference(this.rts.keepElevated());
            }
        }
        //return p.measure(bodyCode);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//  resolved attributes
////////////////////////////////////////////////////////////////////////////////////////////////////

export class ResolvedAttribute
{
    private t2pm: traitToPropertyMap;
    public attribute: ICdmAttributeDef;
    public resolvedName: string;
    public resolvedTraits: ResolvedTraitSet;
    public insertOrder: number;

    constructor(wrtDoc : ICdmDocumentDef, attribute: ICdmAttributeDef)
    {
        //let bodyCode = () =>
        {
            this.attribute = attribute;
            this.resolvedTraits = new ResolvedTraitSet(wrtDoc);
            this.resolvedTraits.addRef();
            this.resolvedName = attribute.getName();
        }
        //return p.measure(bodyCode);
    }
    public copy(wrtDoc : ICdmDocumentDef): ResolvedAttribute
    {
        //let bodyCode = () =>
        {
            let copy = new ResolvedAttribute(wrtDoc, this.attribute);
            copy.resolvedName = this.resolvedName;
            copy.resolvedTraits = this.resolvedTraits.shallowCopy();
            copy.resolvedTraits.addRef();
            copy.insertOrder = this.insertOrder;
            return copy;
        }
        //return p.measure(bodyCode);
    }
    public spew(indent: string)
    {
        //let bodyCode = () =>
        {
            console.log(`${indent}[${this.resolvedName}]`);
            this.resolvedTraits.spew(indent + '-');
        }
        //return p.measure(bodyCode);
    }

    public get isPrimaryKey(): boolean {
        return this.getTraitToPropertyMap().getPropertyValue("isPrimaryKey");
    }
    public get isReadOnly(): boolean {
        return this.getTraitToPropertyMap().getPropertyValue("isReadOnly");
    }
    public get isNullable(): boolean {
        return this.getTraitToPropertyMap().getPropertyValue("isNullable");
    }
    public get dataFormat(): string {
        return this.getTraitToPropertyMap().getPropertyValue("dataFormat");
    }
    public get sourceName(): string {
        return this.getTraitToPropertyMap().getPropertyValue("sourceName");
    }
    public get sourceOrdering(): number {
        return this.getTraitToPropertyMap().getPropertyValue("sourceOrdering");
    }
    public get displayName(): string {
        return this.getTraitToPropertyMap().getPropertyValue("displayName");
    }
    public get description(): string {
        return this.getTraitToPropertyMap().getPropertyValue("description");
    }
    public get maximumValue(): string {
        return this.getTraitToPropertyMap().getPropertyValue("maximumValue");
    }
    public get minimumValue(): string {
        return this.getTraitToPropertyMap().getPropertyValue("minimumValue");
    }
    public get maximumLength(): number {
        return this.getTraitToPropertyMap().getPropertyValue("maximumLength");
    }
    public get valueConstrainedToList(): boolean {
        return this.getTraitToPropertyMap().getPropertyValue("valueConstrainedToList");
    }
    public get defaultValue(): any {
        return this.getTraitToPropertyMap().getPropertyValue("defaultValue");
    }    
    public get creationSequence(): number {
        return this.insertOrder;
    }

    private getTraitToPropertyMap()
    {
        if (this.t2pm)
            return this.t2pm;
        this.t2pm = new traitToPropertyMap();
        this.t2pm.initForResolvedAttribute(this.resolvedTraits);
        return this.t2pm;
    }    
}

export class ResolvedAttributeSet extends refCounted
{
    resolvedName2resolvedAttribute: Map<string, ResolvedAttribute>;
    baseTrait2Attributes: Map<string, Set<ResolvedAttribute>>;
    set: Array<ResolvedAttribute>;
    wrtDoc : ICdmDocumentDef; 
    constructor(wrtDoc : ICdmDocumentDef)
    {
        super();
        //let bodyCode = () =>
        {
            this.wrtDoc = wrtDoc;
            this.resolvedName2resolvedAttribute = new Map<string, ResolvedAttribute>();
            this.set = new Array<ResolvedAttribute>();
        }
        //return p.measure(bodyCode);
    }
    public merge(toMerge: ResolvedAttribute): ResolvedAttributeSet
    {
        //let bodyCode = () =>
        {
            let rasResult: ResolvedAttributeSet = this;
            if (toMerge) {
                if (rasResult.resolvedName2resolvedAttribute.has(toMerge.resolvedName)) {
                    let existing: ResolvedAttribute = rasResult.resolvedName2resolvedAttribute.get(toMerge.resolvedName);
                    if (this.refCnt > 1 && existing.attribute !== toMerge.attribute) {
                        rasResult = rasResult.copy(); // copy on write
                        existing = rasResult.resolvedName2resolvedAttribute.get(toMerge.resolvedName);
                    }
                    existing.attribute = toMerge.attribute; // replace with newest version

                    let rtsMerge = existing.resolvedTraits.mergeSet(toMerge.resolvedTraits) // newest one may replace
                    if (rtsMerge !== existing.resolvedTraits) {
                        rasResult = rasResult.copy(); // copy on write
                        existing = rasResult.resolvedName2resolvedAttribute.get(toMerge.resolvedName);
                        existing.resolvedTraits.release();
                        existing.resolvedTraits = rtsMerge;
                        existing.resolvedTraits.addRef();
                    }
                }
                else {
                    if (this.refCnt > 1)
                        rasResult = rasResult.copy(); // copy on write
                    rasResult.resolvedName2resolvedAttribute.set(toMerge.resolvedName, toMerge);
                    toMerge.insertOrder = rasResult.set.length;
                    rasResult.set.push(toMerge);
                }
                this.baseTrait2Attributes = null;
            }
            return rasResult;
        }
        //return p.measure(bodyCode);
    }
    public mergeSet(toMerge: ResolvedAttributeSet): ResolvedAttributeSet
    {
        //let bodyCode = () =>
        {
            let rasResult: ResolvedAttributeSet = this;
            if (toMerge) {
                let l = toMerge.set.length;
                for (let i = 0; i < l; i++) {
                    let rasMerged = rasResult.merge(toMerge.set[i]);
                    if (rasMerged !== rasResult) {
                        rasResult = rasMerged;
                    }
                }
            }
            return rasResult;
        }
        //return p.measure(bodyCode);
    }

    public mergeTraitAttributes(traits: ResolvedTraitSet, continuationsIn: ApplierContinuationSet): ApplierContinuationSet
    {
        //let bodyCode = () =>
        {
            // if there was no continuation set provided, build one 
            if (!continuationsIn) {
                continuationsIn = new ApplierContinuationSet();
                // collect a set of appliers for all traits
                let appliers = new Array<[ResolvedTrait, traitApplier]>();
                let iApplier = 0;
                if (traits) {
                    let l = traits.size;
                    for (let i = 0; i < l; i++) {
                        const rt = traits.set[i];
                        if (rt.trait.modifiesAttributes) {
                            let traitAppliers = rt.trait.getTraitAppliers();
                            if (traitAppliers) {
                                let l = traitAppliers.length;
                                for (let ita = 0; ita < l; ita++) {
                                    const apl = traitAppliers[ita];
                                    if (apl.attributeAdd)
                                        appliers.push([rt, apl]);
                                }
                            }
                        }
                    }
                }
                if (appliers.length == 0)
                    return null;

                for (const resTraitApplier of appliers) {
                    let applier: traitApplier = resTraitApplier["1"];
                    let rt: ResolvedTrait = resTraitApplier["0"];

                    // if there are no attributes, this is an entity attribute 
                    if (this.resolvedName2resolvedAttribute.size == 0) {
                        continuationsIn.continuations.push({ applier: applier, resAtt: null, resTrait: rt, continuationState: null });
                    }
                    else {
                        // one for each attribute and applier combo
                        let l = this.set.length;
                        for (let i = 0; i < l; i++) {
                            continuationsIn.continuations.push({ applier: applier, resAtt: this.set[i], resTrait: rt, continuationState: null });
                        }
                    }
                }
            }

            // for every attribute in the set run any attribute adders and collect results in a new set
            let addedAttSet: ResolvedAttributeSet = new ResolvedAttributeSet(this.wrtDoc);
            addedAttSet.addRef();
            let continuationsOut = new ApplierContinuationSet();

            for (const continueWith of continuationsIn.continuations) {
                if (continueWith.applier.willAdd(this.wrtDoc, continueWith.resAtt, continueWith.resTrait, continueWith.continuationState)) {
                    let result = continueWith.applier.attributeAdd(this.wrtDoc, continueWith.resAtt, continueWith.resTrait, continueWith.continuationState);
                    // create a new resolved attribute and apply the traits that it has
                    let newAttSet: ResolvedAttributeSet = new ResolvedAttributeSet(this.wrtDoc);
                    newAttSet.addRef()
                    let mergeOne = newAttSet.merge(new ResolvedAttribute(this.wrtDoc, result.addedAttribute).copy(this.wrtDoc));
                    mergeOne.addRef();
                    newAttSet.release();
                    newAttSet = mergeOne;

                    newAttSet.applyTraits(result.addedAttribute.getResolvedTraits(this.wrtDoc));
                    // accumulate all added
                    let mergeResult = addedAttSet.mergeSet(newAttSet);
                    mergeResult.addRef();
                    addedAttSet.release()
                    addedAttSet = mergeResult;

                    // if a continue requested, add to list
                    if (result.continuationState)
                        continuationsOut.continuations.push({ applier: continueWith.applier, resAtt: continueWith.resAtt, resTrait: continueWith.resTrait, continuationState: result.continuationState });
                }
            }

            continuationsOut.rasResult = this.mergeSet(addedAttSet);
            continuationsOut.rasResult.addRef();

            if (!continuationsOut.continuations.length)
                continuationsOut.continuations = null;
            return continuationsOut;
        }
        //return p.measure(bodyCode);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  traits that change attributes
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    public applyTraits(traits: ResolvedTraitSet): ResolvedAttributeSet
    {
        //let bodyCode = () =>
        {
            // collect a set of appliers for all traits
            let appliers = new Array<[ResolvedTrait, traitApplier]>();
            let iApplier = 0;
            if (traits) {
                let l = traits.size;
                for (let i = 0; i < l; i++) {
                    const rt = traits.set[i];
                    if (rt.trait.modifiesAttributes) {
                        let traitAppliers = rt.trait.getTraitAppliers();
                        if (traitAppliers) {
                            let l = traitAppliers.length;
                            for (let ita = 0; ita < l; ita++) {
                                const apl = traitAppliers[ita];
                                if (apl.attributeApply)
                                    appliers.push([rt, apl]);
                            }
                        }
                    }
                }
            }

            // sorted by priority
            appliers = appliers.sort((l: [ResolvedTrait, traitApplier], r: [ResolvedTrait, traitApplier]) => r["1"].priority - l["1"].priority);

            let rasResult: ResolvedAttributeSet = this;
            let rasApplied: ResolvedAttributeSet;

            if (this.refCnt > 1 && rasResult.copyNeeded(traits, appliers)) {
                rasResult = rasResult.copy();
            }
            rasApplied = rasResult.apply(traits, appliers);

            // now we are that
            rasResult.resolvedName2resolvedAttribute = rasApplied.resolvedName2resolvedAttribute;
            rasResult.baseTrait2Attributes = null;
            rasResult.set = rasApplied.set;
            return rasResult;
        }
        //return p.measure(bodyCode);
    }

    copyNeeded(traits: ResolvedTraitSet, appliers: Array<[ResolvedTrait, traitApplier]>): boolean
    {
        //let bodyCode = () =>
        {
            // for every attribute in the set, detect if a merge of traits will alter the traits. if so, need to copy the attribute set to avoid overwrite 
            let l = this.set.length;
            for (let i = 0; i < l; i++) {
                const resAtt = this.set[i];
                if (resAtt.resolvedTraits.mergeSetWillAlter(traits, resAtt.attribute))
                    return true;
                for (const resTraitApplier of appliers) {
                    let applier: traitApplier = resTraitApplier["1"];
                    let rt: ResolvedTrait = resTraitApplier["0"];
                    if (applier.willApply(this.wrtDoc, resAtt, rt))
                        return true;
                }
            }
            return false;
        }
        //return p.measure(bodyCode);
    }

    apply(traits: ResolvedTraitSet, appliers: Array<[ResolvedTrait, traitApplier]>): ResolvedAttributeSet
    {
        //let bodyCode = () =>
        {
            // for every attribute in the set run any attribute appliers
            let appliedAttSet: ResolvedAttributeSet = new ResolvedAttributeSet(this.wrtDoc);
            let l = this.set.length;
            for (let i = 0; i < l; i++) {
                const resAtt = this.set[i];
                let rtsMerge = resAtt.resolvedTraits.mergeSet(traits, resAtt.attribute);
                resAtt.resolvedTraits.release();
                resAtt.resolvedTraits = rtsMerge;
                resAtt.resolvedTraits.addRef();
                for (const resTraitApplier of appliers) {
                    let applier: traitApplier = resTraitApplier["1"];
                    let rt: ResolvedTrait = resTraitApplier["0"];
                    if (applier.willApply(this.wrtDoc, resAtt, rt)) {
                        applier.attributeApply(this.wrtDoc, resAtt, rt);
                    }
                }
                appliedAttSet.merge(resAtt);
            }
            return appliedAttSet;
        }
        //return p.measure(bodyCode);
    }

    public removeRequestedAtts(): ResolvedAttributeSet
    {
        //let bodyCode = () =>
        {
            // for every attribute in the set run any attribute removers on the traits they have
            let appliedAttSet: ResolvedAttributeSet = new ResolvedAttributeSet(this.wrtDoc);
            let l = this.set.length;
            for (let i = 0; i < l; i++) {
                let resAtt = this.set[i];
                if (resAtt.resolvedTraits) {
                    let l = resAtt.resolvedTraits.size;
                    for (let i = 0; resAtt && i < l; i++) {
                        const rt = resAtt.resolvedTraits.set[i];
                        if (resAtt && rt.trait.modifiesAttributes) {
                            let traitAppliers = rt.trait.getTraitAppliers();
                            if (traitAppliers) {
                                let l = traitAppliers.length;
                                for (let ita = 0; ita < l; ita++) {
                                    const apl = traitAppliers[ita];
                                    if (resAtt && apl.attributeRemove) {
                                        let result = apl.attributeRemove(this.wrtDoc, resAtt, rt);
                                        if (result.shouldDelete) {
                                            resAtt = null;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (resAtt)
                    appliedAttSet.merge(resAtt);
            }

            // now we are that (or a copy)
            let rasResult: ResolvedAttributeSet = this;
            if (this.refCnt > 1 && appliedAttSet.size != rasResult.size) {
                rasResult = appliedAttSet;
            }

            rasResult.resolvedName2resolvedAttribute = appliedAttSet.resolvedName2resolvedAttribute;
            rasResult.baseTrait2Attributes = null;
            rasResult.set = appliedAttSet.set;
            return rasResult;
        }
        //return p.measure(bodyCode);
    }

    getAttributesWithTraits(queryFor: TraitSpec | TraitSpec[]): ResolvedAttributeSet
    {
        //let bodyCode = () =>
        {
            // put the input into a standard form
            let query = new Array<TraitParamSpec>();
            if (queryFor instanceof Array) {
                let l = queryFor.length;
                for (let i = 0; i < l; i++) {
                    let q = queryFor[i];
                    if (typeof (q) === "string")
                        query.push({ traitBaseName: q, params: [] })
                    else
                        query.push(q);
                }
            }
            else {
                if (typeof (queryFor) === "string")
                    query.push({ traitBaseName: queryFor, params: [] })
                else
                    query.push(queryFor);
            }

            // if the map isn't in place, make one now. assumption is that this is called as part of a usage pattern where it will get called again.
            if (!this.baseTrait2Attributes) {
                this.baseTrait2Attributes = new Map<string, Set<ResolvedAttribute>>();
                let l = this.set.length;
                for (let i = 0; i < l; i++) {
                    // create a map from the name of every trait found in this whole set of attributes to the attributes that have the trait (included base classes of traits)
                    const resAtt = this.set[i];
                    let traitNames = resAtt.resolvedTraits.collectTraitNames();
                    traitNames.forEach(tName =>
                    {
                        if (!this.baseTrait2Attributes.has(tName))
                            this.baseTrait2Attributes.set(tName, new Set<ResolvedAttribute>());
                        this.baseTrait2Attributes.get(tName).add(resAtt);
                    });
                }
            }
            // for every trait in the query, get the set of attributes.
            // intersect these sets to get the final answer
            let finalSet: Set<ResolvedAttribute>;
            let lQuery = query.length;
            for (let i = 0; i < lQuery; i++) {
                const q = query[i];
                if (this.baseTrait2Attributes.has(q.traitBaseName)) {
                    let subSet = this.baseTrait2Attributes.get(q.traitBaseName);
                    if (q.params && q.params.length) {
                        // need to check param values, so copy the subset to something we can modify 
                        let filteredSubSet = new Set<ResolvedAttribute>();
                        subSet.forEach(ra =>
                        {
                            // get parameters of the the actual trait matched
                            let pvals = ra.resolvedTraits.find(this.wrtDoc, q.traitBaseName).parameterValues;
                            // compare to all query params
                            let lParams = q.params.length;
                            let iParam;
                            for (iParam = 0; iParam < lParams; iParam++) {
                                const param = q.params[i];
                                let pv = pvals.getParameterValue(param.paramName);
                                if (!pv || pv.getValueString(this.wrtDoc) != param.paramValue)
                                    break;
                            }
                            // stop early means no match
                            if (iParam == lParams)
                                filteredSubSet.add(ra);
                        });
                        subSet = filteredSubSet;
                    }
                    if (subSet && subSet.size) {
                        // got some. either use as starting point for answer or intersect this in
                        if (!finalSet)
                            finalSet = subSet;
                        else {
                            let intersection = new Set<ResolvedAttribute>();
                            // intersect the two
                            finalSet.forEach(ra =>
                            {
                                if (subSet.has(ra))
                                    intersection.add(ra);
                            });
                            finalSet = intersection;
                        }
                    }
                }
            }

            // collect the final set into a resolvedAttributeSet
            if (finalSet && finalSet.size) {
                let rasResult = new ResolvedAttributeSet(this.wrtDoc);
                finalSet.forEach(ra =>
                {
                    rasResult.merge(ra);
                });
                return rasResult;
            }

            return null;

        }
        //return p.measure(bodyCode);
    }


    public get(name: string): ResolvedAttribute
    {
        //let bodyCode = () =>
        {
            if (this.resolvedName2resolvedAttribute.has(name)) {
                return this.resolvedName2resolvedAttribute.get(name);
            }
            return null;
        }
        //return p.measure(bodyCode);
    }
    public get size(): number
    {
        return this.resolvedName2resolvedAttribute.size;
    }
    public copy(): ResolvedAttributeSet
    {
        //let bodyCode = () =>
        {
            let copy = new ResolvedAttributeSet(this.wrtDoc);
            let l = this.set.length;
            for (let i = 0; i < l; i++) {
                copy.merge(this.set[i].copy(this.wrtDoc));
            }
            return copy;
        }
        //return p.measure(bodyCode);
    }
    public spew(indent: string)
    {
        //let bodyCode = () =>
        {
            let l = this.set.length;
            for (let i = 0; i < l; i++) {
                this.set[i].spew(indent);
            }
        }
        //return p.measure(bodyCode);
    }
}

class ResolvedAttributeSetBuilder
{
    public ras: ResolvedAttributeSet;
    public inheritedMark: number;
    wrtDoc : ICdmDocumentDef;
    constructor (wrtDoc : ICdmDocumentDef) {
        this.wrtDoc = wrtDoc;
    }
    public mergeAttributes(rasNew: ResolvedAttributeSet)
    {
        //let bodyCode = () =>
        {
            if (rasNew) {
                if (!this.ras)
                    this.takeReference(rasNew);
                else
                    this.takeReference(this.ras.mergeSet(rasNew));
            }
        }
        //return p.measure(bodyCode);
    }

    public takeReference(rasNew: ResolvedAttributeSet)
    {
        //let bodyCode = () =>
        {
            if (this.ras !== rasNew) {
                if (rasNew)
                    rasNew.addRef();
                if (this.ras)
                    this.ras.release();
                this.ras = rasNew;
            }
        }
        //return p.measure(bodyCode);
    }

    public ownOne(ra: ResolvedAttribute)
    {
        //let bodyCode = () =>
        {
            this.takeReference(new ResolvedAttributeSet(this.wrtDoc));
            this.ras.merge(ra);
        }
        //return p.measure(bodyCode);
    }
    public applyTraits(rts: ResolvedTraitSet)
    {
        //let bodyCode = () =>
        {
            if (this.ras)
                this.takeReference(this.ras.applyTraits(rts));
        }
        //return p.measure(bodyCode);
    }

    public mergeTraitAttributes(rts: ResolvedTraitSet)
    {
        //let bodyCode = () =>
        {
            if (!this.ras)
                this.takeReference(new ResolvedAttributeSet(this.wrtDoc));

            let localContinue: ApplierContinuationSet = null;
            while (localContinue = this.ras.mergeTraitAttributes(rts, localContinue)) {
                this.takeReference(localContinue.rasResult)
                if (!localContinue.continuations)
                    break;
            }
        }
        //return p.measure(bodyCode);
    }
    public removeRequestedAtts()
    {
        //let bodyCode = () =>
        {
            if (this.ras) {
                this.takeReference(this.ras.removeRequestedAtts());
            }
        }
        //return p.measure(bodyCode);
    }
    public markInherited()
    {
        //let bodyCode = () =>
        {
            if (this.ras && this.ras.set)
                this.inheritedMark = this.ras.set.length;
            else
                this.inheritedMark = 0;
        }
        //return p.measure(bodyCode);
    }

}

export class ResolvedEntityReferenceSide
{
    public entity: ICdmEntityDef;
    public rasb: ResolvedAttributeSetBuilder;

    constructor(wrtDoc : ICdmDocumentDef, entity?: ICdmEntityDef, rasb?: ResolvedAttributeSetBuilder)
    {
        //let bodyCode = () =>
        {
            if (entity)
                this.entity = entity;
            if (rasb)
                this.rasb = rasb;
            else
                this.rasb = new ResolvedAttributeSetBuilder(wrtDoc);
        }
        //return p.measure(bodyCode);
    }
    public getFirstAttribute(): ResolvedAttribute
    {
        //let bodyCode = () =>
        {
            if (this.rasb && this.rasb.ras && this.rasb.ras.set && this.rasb.ras.set.length)
                return this.rasb.ras.set[0];
        }
        //return p.measure(bodyCode);
    }
    public spew(indent: string)
    {
        //let bodyCode = () =>
        {
            console.log(`${indent} ent=${this.entity.getName()}`);
            this.rasb.ras.spew(indent + '  atts:');
        }
        //return p.measure(bodyCode);
    }

}

export class ResolvedEntityReference
{
    public referencing: ResolvedEntityReferenceSide;
    public referenced: ResolvedEntityReferenceSide[];
    wrtDoc : ICdmDocumentDef;

    constructor(wrtDoc : ICdmDocumentDef)
    {
        //let bodyCode = () =>
        {
            this.wrtDoc = wrtDoc;
            this.referencing = new ResolvedEntityReferenceSide(this.wrtDoc);
            this.referenced = new Array<ResolvedEntityReferenceSide>();
        }
        //return p.measure(bodyCode);
    }
    public copy(): ResolvedEntityReference
    {
        //let bodyCode = () =>
        {
            let result = new ResolvedEntityReference(this.wrtDoc);
            result.referencing.entity = this.referencing.entity;
            result.referencing.rasb = this.referencing.rasb;
            this.referenced.forEach(rers =>
            {
                result.referenced.push(new ResolvedEntityReferenceSide(this.wrtDoc, rers.entity, rers.rasb));
            });
            return result;
        }
        //return p.measure(bodyCode);
    }

    public spew(indent: string)
    {
        //let bodyCode = () =>
        {
            this.referencing.spew(indent + "(referencing)");
            for (let i = 0; i < this.referenced.length; i++) {
                this.referenced[i].spew(indent + `(referenced[${i}])`);
            }
        }
        //return p.measure(bodyCode);
    }

}

export class ResolvedEntity 
{
    private t2pm: traitToPropertyMap;
    public entity : ICdmEntityDef;
    public resolvedName : string;
    public resolvedTraits : ResolvedTraitSet;
    public resolvedAttributes : ResolvedAttributeSet;
    public resolvedEntityReferences : ResolvedEntityReferenceSet;
    constructor(wrtDoc : ICdmDocumentDef, entDef : ICdmEntityDef) {
        this.entity = entDef;
        this.resolvedName = this.entity.getName();
        this.resolvedTraits = this.entity.getResolvedTraits(wrtDoc);
        this.resolvedAttributes = this.entity.getResolvedAttributes(wrtDoc);
        this.resolvedEntityReferences = this.entity.getResolvedEntityReferences(wrtDoc);
    }
    public get sourceName() : string
    {
        return this.getTraitToPropertyMap().getPropertyValue("sourceName");
    }
    public get description() : string
    {
        return this.getTraitToPropertyMap().getPropertyValue("description");
    }
    public get displayName() : string
    {
        return this.getTraitToPropertyMap().getPropertyValue("displayName");
    }
    public get version() : string
    {
        return this.getTraitToPropertyMap().getPropertyValue("version");
    }
    public get cdmSchemas() : string[]
    {
        return this.getTraitToPropertyMap().getPropertyValue("cdmSchemas");
    }

    private getTraitToPropertyMap()
    {
        if (this.t2pm)
            return this.t2pm;
        this.t2pm = new traitToPropertyMap();
        this.t2pm.initForResolvedEntity(this.resolvedTraits);
        return this.t2pm;
    }
}

export class ResolvedEntityReferenceSet
{
    set: Array<ResolvedEntityReference>;
    wrtDoc : ICdmDocumentDef; 
    constructor(wrtDoc : ICdmDocumentDef, set: Array<ResolvedEntityReference> = undefined)
    {
        //let bodyCode = () =>
        {
            this.wrtDoc = wrtDoc;
            if (set) {
                this.set = set;
            }
            else
                this.set = new Array<ResolvedEntityReference>();
        }
        //return p.measure(bodyCode);
    }
    public add(toAdd: ResolvedEntityReferenceSet)
    {
        //let bodyCode = () =>
        {
            if (toAdd && toAdd.set && toAdd.set.length) {
                this.set = this.set.concat(toAdd.set);
            }
        }
        //return p.measure(bodyCode);
    }
    public copy(): ResolvedEntityReferenceSet
    {
        //let bodyCode = () =>
        {
            let newSet = this.set.slice(0);
            for (let i = 0; i < newSet.length; i++) {
                newSet[i] = newSet[i].copy();
            }
            return new ResolvedEntityReferenceSet(this.wrtDoc, newSet);
        }
        //return p.measure(bodyCode);
    }
    public findEntity(entOther: ICdmEntityDef): ResolvedEntityReferenceSet
    {
        //let bodyCode = () =>
        {
            // make an array of just the refs that include the requested
            let filter = this.set.filter((rer: ResolvedEntityReference): boolean =>
            {
                return (rer.referenced.some((rers: ResolvedEntityReferenceSide): boolean =>
                {
                    if (rers.entity === entOther)
                        return true;
                }));
            })

            if (filter.length == 0)
                return null;
            return new ResolvedEntityReferenceSet(this.wrtDoc, filter);
        }
        //return p.measure(bodyCode);
    }

    public spew(indent: string)
    {
        //let bodyCode = () =>
        {
            for (let i = 0; i < this.set.length; i++) {
                this.set[i].spew(indent + `(rer[${i}])`);
            }
        }
        //return p.measure(bodyCode);
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////
//  attribute and entity traits that are represented as properties
////////////////////////////////////////////////////////////////////////////////////////////////////

// this entire class is gross. it is a different abstraction level than all of the rest of this om.
// however, it does make it easier to work with the consumption object model so ... i will hold my nose.
class traitToPropertyMap
{

    hostEnt: ICdmEntityDef;
    hostAtt: ICdmTypeAttributeDef;
    traits: (ResolvedTrait | ICdmTraitRef)[];
    hostRtsEnt: ResolvedTraitSet;
    hostRtsAtt: ResolvedTraitSet;

    public initForEntityDef(persistedObject: Entity, host: ICdmObject)
    {
        //let bodyCode = () =>
        {
            this.hostEnt = host as ICdmEntityDef;
            this.traits = this.hostEnt.getExhibitedTraitRefs();
            let tr : ICdmTraitRef;
            // turn properties into traits for internal form
            if (persistedObject) {
                if (persistedObject.sourceName) {
                    this.setTraitArgument("is.CDS.sourceNamed", "name", persistedObject.sourceName)
                }
                if (persistedObject.displayName) {
                    this.setLocalizedTraitTable("is.localized.displayedAs", persistedObject.displayName);
                }
                if (persistedObject.description) {
                    this.setLocalizedTraitTable("is.localized.describedAs", persistedObject.description);
                }
                if (persistedObject.version) {
                    this.setTraitArgument("is.CDM.entityVersion", "versionNumber", persistedObject.version);
                }
                if (persistedObject.cdmSchemas) {
                    this.setSingleAttTraitTable("is.CDM.attributeGroup", "groupList", "attributeGroupSet", persistedObject.cdmSchemas);
                }
            }
        }
        //return p.measure(bodyCode);
    }

    public initForResolvedEntity(rtsEnt : ResolvedTraitSet) {
        this.hostRtsEnt = rtsEnt;
        this.traits = rtsEnt.set;
    }

    public initForTypeAttributeDef(persistedObject: TypeAttribute, host: ICdmObject)
    {
        //let bodyCode = () =>
        {
            this.hostAtt = host as ICdmTypeAttributeDef;
            this.traits = this.hostAtt.getAppliedTraitRefs();

            // turn properties into traits for internal form
            if (persistedObject) {
                if (persistedObject.isReadOnly) {
                    this.getTrait("is.readOnly", true, true);
                }
                if (persistedObject.isNullable) {
                    this.getTrait("is.nullable", true, true);
                }
                if (persistedObject.sourceName) {
                    this.setTraitArgument("is.CDS.sourceNamed", "name", persistedObject.sourceName);
                }
                if (persistedObject.sourceOrdering) {
                    this.setTraitArgument("is.CDS.ordered", "ordinal", persistedObject.sourceOrdering.toString());
                }
                if (persistedObject.displayName) {
                    this.setLocalizedTraitTable("is.localized.displayedAs", persistedObject.displayName);
                }
                if (persistedObject.description) {
                    this.setLocalizedTraitTable("is.localized.describedAs", persistedObject.description);
                }
                if (persistedObject.valueConstrainedToList) {
                    this.getTrait("is.constrainedList", true, true);
                }
                if (persistedObject.isPrimaryKey) {
                    this.getTrait("is.identifiedBy", true, true);
                }
                if (persistedObject.maximumLength) {
                    this.setTraitArgument("is.constrained", "maximumLength", persistedObject.maximumLength.toString());
                }
                if (persistedObject.maximumValue) {
                    this.setTraitArgument("is.constrained", "maximumValue", persistedObject.maximumValue);
                }
                if (persistedObject.minimumValue) {
                    this.setTraitArgument("is.constrained", "minimumValue", persistedObject.minimumValue);
                }
                if (persistedObject.dataFormat) {
                    this.dataFormatToTraits(persistedObject.dataFormat);
                }
                if (persistedObject.defaultValue) {
                    this.setDefaultValue(persistedObject.defaultValue);
                }
            }
        }
        //return p.measure(bodyCode);
    }

    public initForResolvedAttribute(rtsAtt : ResolvedTraitSet) {
        this.hostRtsAtt = rtsAtt;
        this.traits = rtsAtt.set;
    }


    public persistForEntityDef(persistedObject: Entity)
    {
        //let bodyCode = () =>
        {
            let removedIndexes = new Array<number>();
            if (this.traits) {
                let l = this.traits.length;
                for (let i = 0; i < l; i++) {
                    let traitName = getTraitRefName(this.traits[i]);
                    switch (traitName) {
                        case "is.CDS.sourceNamed":
                            persistedObject.sourceName = getTraitRefArgumentValue(this.traits[i], "name");
                            removedIndexes.push(i);
                            break;
                        case "is.localized.describedAs":
                            persistedObject.description=this.getLocalizedTraitTable("is.localized.describedAs");
                            break;
                        case "is.localized.displayedAs":
                            persistedObject.displayName=this.getLocalizedTraitTable("is.localized.displayedAs");
                            break;
                        case "is.CDM.entityVersion":
                            persistedObject.version = getTraitRefArgumentValue(this.traits[i], "versionNumber");
                            removedIndexes.push(i);
                            break;
                        case "is.CDM.attributeGroup":
                            persistedObject.cdmSchemas = this.getSingleAttTraitTable("is.CDM.attributeGroup", "groupList");
                            removedIndexes.push(i);
                            break;
                    }
                }

                // remove applied traits from the persisted object back to front
                // could make this faster if needed
                for (let iRem = removedIndexes.length - 1; iRem >= 0; iRem--) {
                    persistedObject.exhibitsTraits.splice(removedIndexes[iRem], 1);
                }

                if (persistedObject.exhibitsTraits.length == 0)
                    persistedObject.exhibitsTraits = undefined;
            }
        }
        //return p.measure(bodyCode);
    }

    public persistForTypeAttributeDef(persistedObject: TypeAttribute)
    {
        //let bodyCode = () =>
        {
            this.traitsToDataFormat(persistedObject.appliedTraits);

            let removedIndexes = new Array<number>();
            if (this.traits) {

                let l = this.traits.length;
                for (let i = 0; i < l; i++) {
                    let traitName = getTraitRefName(this.traits[i]);
                    switch (traitName) {
                        case "is.CDS.sourceNamed":
                            persistedObject.sourceName = getTraitRefArgumentValue(this.traits[i], "name");
                            removedIndexes.push(i);
                            break;
                        case "is.CDS.ordered":
                            persistedObject.sourceOrdering = parseInt(getTraitRefArgumentValue(this.traits[i], "ordinal"));
                            removedIndexes.push(i);
                            break;
                        case "is.constrainedList":
                            persistedObject.valueConstrainedToList = true;
                            removedIndexes.push(i);
                            break;
                        case "is.constrained":
                            let temp = getTraitRefArgumentValue(this.traits[i], "maximumLength");
                            if (temp != undefined)
                                persistedObject.maximumLength = parseInt(temp);
                            persistedObject.maximumValue = getTraitRefArgumentValue(this.traits[i], "maximumValue");
                            persistedObject.minimumValue = getTraitRefArgumentValue(this.traits[i], "minimumValue");
                            removedIndexes.push(i);
                            break;
                        case "is.readOnly":
                            persistedObject.isReadOnly = true;
                            removedIndexes.push(i);
                            break;
                        case "is.nullable":
                            persistedObject.isNullable = true;
                            removedIndexes.push(i);
                            break;
                        case "is.localized.describedAs":
                            persistedObject.description=this.getLocalizedTraitTable("is.localized.describedAs");
                            break;
                        case "is.localized.displayedAs":
                            persistedObject.displayName=this.getLocalizedTraitTable("is.localized.displayedAs");
                            break;
                        case "is.identifiedBy":
                            persistedObject.isPrimaryKey = true;
                            removedIndexes.push(i);
                            break;
                        case "does.haveDefault":
                            persistedObject.defaultValue = this.getDefaultValue();
                            removedIndexes.push(i);
                            break;

                    }
                }
            
                // remove applied traits from the persisted object back to front
                // could make this faster if needed
                for (let iRem = removedIndexes.length - 1; iRem >= 0; iRem--) {
                    persistedObject.appliedTraits.splice(removedIndexes[iRem], 1);
                }

                if (persistedObject.appliedTraits.length == 0)
                    persistedObject.appliedTraits = undefined;
            }
        }
        //return p.measure(bodyCode);
    }

    public setPropertyValue(propertyName: string, newValue: any)
    {
        //let bodyCode = () =>
        {
            if (newValue == undefined) {
                if (this.hostAtt)
                    this.hostAtt.removeAppliedTrait(propertyName); // validate a known prop?
                if (this.hostEnt)
                    this.hostEnt.removeExhibitedTrait(propertyName); // validate a known prop?
            }
            else {
                let tr : ICdmTraitRef;
                switch (propertyName) {
                    case "version":
                        this.setTraitArgument("is.CDM.entityVersion", "versionNumber", newValue);
                        break;
                    case "cdmSchemas":
                        this.setSingleAttTraitTable("is.CDM.attributeGroup", "groupList", "attributeGroupSet", newValue);
                        break;
                    case "sourceName":
                        this.setTraitArgument("is.CDS.sourceNamed", "name", newValue);
                        break;
                    case "displayName":
                        this.setLocalizedTraitTable("is.localized.displayedAs", newValue);
                        break;
                    case "description":
                        this.setLocalizedTraitTable("is.localized.describedAs", newValue);
                        break;
                    case "cdmSchemas":
                        this.setSingleAttTraitTable("is.CDM.attributeGroup", "groupList", "attributeGroupSet", newValue);
                        break;
                    case "sourceOrdering":
                        this.setTraitArgument("is.CDS.ordered", "ordinal", newValue.toString());
                        break;
                    case "isPrimaryKey":
                        if (newValue)
                            this.getTrait("is.identifiedBy", true, true);
                        if (!newValue)
                            this.hostAtt.removeAppliedTrait("is.identifiedBy");
                        break;
                    case "isReadOnly":
                        if (newValue)
                            this.getTrait("is.readOnly", true, true);
                        if (!newValue)
                            this.hostAtt.removeAppliedTrait("is.readOnly");
                        break;
                    case "isNullable":
                        if (newValue)
                            this.getTrait("is.nullable", true, true);
                        if (!newValue)
                            this.hostAtt.removeAppliedTrait("is.nullable");
                        break;
                    case "valueConstrainedToList":
                        if (newValue)
                            this.getTrait("is.constrainedList", true, true);
                        if (!newValue)
                            this.hostAtt.removeAppliedTrait("is.constrainedList");
                        break;
                    case "maximumValue":
                        this.setTraitArgument("is.constrained", "maximumValue", newValue);
                        break;
                    case "minimumValue":
                        this.setTraitArgument("is.constrained", "minimumValue", newValue);
                        break;
                    case "maximumLength":
                        this.setTraitArgument("is.constrained", "maximumLength", newValue.toString());
                        break;
                    case "dataFormat":
                        this.dataFormatToTraits(newValue);
                        break;
                    case "defaultValue":
                        this.setDefaultValue(newValue);
                        break;
                }
            }

        }
        //return p.measure(bodyCode);
    }
    public getPropertyValue(propertyName: string): any
    {
        //let bodyCode = () =>
        {
            switch (propertyName) {
                case "version":
                    return getTraitRefArgumentValue(this.getTrait("is.CDM.entityVersion", false), "versionNumber");
                case "sourceName":
                    return getTraitRefArgumentValue(this.getTrait("is.CDS.sourceNamed", false), "name");
                case "displayName":
                    return this.getLocalizedTraitTable("is.localized.displayedAs");
                case "description":
                    return this.getLocalizedTraitTable("is.localized.describedAs");
                case "cdmSchemas":
                    return this.getSingleAttTraitTable("is.CDM.attributeGroup", "groupList");
                case "sourceOrdering":
                    return parseInt(getTraitRefArgumentValue(this.getTrait("is.CDS.ordered", false), "ordinal"));
                case "isPrimaryKey":
                    return this.getTrait("is.identifiedBy", false) != undefined;
                case "isNullable":
                    return this.getTrait("is.nullable", false) != undefined;
                case "isReadOnly":
                    return this.getTrait("is.readOnly", false) != undefined;
                case "valueConstrainedToList":
                    return this.getTrait("is.constrainedList", false) != undefined;
                case "maximumValue":
                    return getTraitRefArgumentValue(this.getTrait("is.constrained", false), "maximumValue");
                case "minimumValue":
                    return getTraitRefArgumentValue(this.getTrait("is.constrained", false), "minimumValue");
                case "maximumLength":
                    let temp = getTraitRefArgumentValue(this.getTrait("is.constrained", false), "maximumLength");
                    if (temp != undefined)
                        return parseInt(temp);
                    break;
                case "dataFormat":
                    return this.traitsToDataFormat();
                case "primaryKey":
                    let attRef : ICdmTypeAttributeDef = getTraitRefArgumentValue(this.getTrait("is.identifiedBy", false), "attribute");
                    if (attRef)
                        return attRef.getObjectDefName();
                    break;
                case "defaultValue":
                    return this.getDefaultValue();
            }
        }
        //return p.measure(bodyCode);
    }


    dataFormatToTraits(dataFormat : string)  {
        //let bodyCode = () =>
        {
            // if this is going to be called many times, then need to remove any dataformat traits that are left behind.
            // but ... probably not. in fact, this is probably never used because data formats come from data type which is not an attribute
            switch (dataFormat) {
                case "Int16":
                    this.getTrait("is.dataFormat.integer", true, true);
                    this.getTrait("is.dataFormat.small", true, true);
                    break;
                case "Int32":
                    this.getTrait("is.dataFormat.integer", true, true);
                    this.getTrait("is.dataFormat.small", true, true);
                    break;
                case "Int64":
                    this.getTrait("is.dataFormat.integer", true, true);
                    this.getTrait("is.dataFormat.big", true, true);
                    break;
                case "Float":
                    this.getTrait("is.dataFormat.floatingPoint", true, true);
                    break;
                case "Double":
                    this.getTrait("is.dataFormat.floatingPoint", true, true);
                    this.getTrait("is.dataFormat.big", true, true);
                    break;
                case "Guid":
                    this.getTrait("is.dataFormat.guid", true, true);
                case "String":
                    this.getTrait("is.dataFormat.array", true, true);
                case "Char":
                    this.getTrait("is.dataFormat.character", true, true);
                    this.getTrait("is.dataFormat.big", true, true);
                    break;
                case "Byte":
                    this.getTrait("is.dataFormat.byte", true, true);
                case "Binary":
                    this.getTrait("is.dataFormat.array", true, true);
                    break;
                case "Time":
                    this.getTrait("is.dataFormat.time", true, true);
                    break;
                case "Date":
                    this.getTrait("is.dataFormat.date", true, true);
                    break;
                case "DateTimeOffset":
                    this.getTrait("is.dataFormat.time", true, true);
                    this.getTrait("is.dataFormat.date", true, true);
                    break;
                case "Boolean":
                    this.getTrait("is.dataFormat.boolean", true, true);
                    break;
                case "Decimal":
                    this.getTrait("is.dataFormat..numeric.shaped", true, true);
                    break;
            }
        }
        //return p.measure(bodyCode);
    }

    traitsToDataFormat(removeFrom : any[] = undefined) : string {
        //let bodyCode = () =>
        {
            let isArray = false;
            let isBig = false;
            let isSmall = false;
            let baseType : string = "Unknown";
            let removedIndexes = new Array<number>();
            if (this.traits) {
                let l = this.traits.length;
                for (let i = 0; i < l; i++) {
                    let traitName = getTraitRefName(this.traits[i]);
                    switch (traitName) {
                        case "is.dataFormat.array":
                            isArray = true;
                            removedIndexes.push(i);
                            break;
                        case "is.dataFormat.big":
                            isBig = true;
                            removedIndexes.push(i);
                            break;
                        case "is.dataFormat.small":
                            isSmall = true;
                            removedIndexes.push(i);
                            break;
                        case "is.dataFormat.integer":
                            baseType = "Int";
                            removedIndexes.push(i);
                            break;
                        case "is.dataFormat.floatingPoint":
                            baseType = "Float";
                            removedIndexes.push(i);
                            break;
                        case "is.dataFormat.character":
                            if (baseType != "Guid")
                                baseType = "Char";
                            removedIndexes.push(i);
                            break;
                        case "is.dataFormat.byte":
                            baseType = "Byte";
                            removedIndexes.push(i);
                            break;
                        case "is.dataFormat.date":
                            if (baseType == "Time")
                                baseType = "DateTimeOffset";
                            else
                                baseType = "Date";
                            removedIndexes.push(i);
                            break;
                        case "is.dataFormat.time":
                            if (baseType == "Date")
                                baseType = "DateTimeOffset";
                            else
                                baseType = "Time";
                            removedIndexes.push(i);
                            break;
                        case "is.dataFormat.boolean":
                            baseType = "Boolean";
                            removedIndexes.push(i);
                            break;
                        case "is.dataFormat.numeric.shaped":
                            baseType = "Decimal";
                            removedIndexes.push(i);
                            break;
                        case "is.dataFormat.guid":
                            baseType = "Guid";
                            removedIndexes.push(i);
                            break;
                    }
                }

                if (isArray) {
                    if (baseType == "Char")
                        baseType = "String";
                    else if (baseType == "Byte")
                        baseType = "Binary";
                    else if (baseType != "Guid")
                        baseType = "Unknown";
                }

                if (baseType == "Float" && isBig)
                    baseType = "Double";
                if (baseType == "Int" && isBig)
                    baseType = "Int64";
                if (baseType == "Int" && isSmall)
                    baseType = "Int16";
                if (baseType == "Int")
                    baseType = "Int32";
            
                // remove applied traits from the persisted object back to front
                if (removeFrom) {
                    for (let iRem = removedIndexes.length - 1; iRem >= 0; iRem--) {
                        removeFrom.splice(removedIndexes[iRem], 1);
                    }
                }
            }
            return baseType;
        }
        //return p.measure(bodyCode);
    }


    getTrait(trait : string | ICdmTraitRef | ResolvedTrait, create = false, simpleRef = false) : ICdmTraitRef {
        let traitName:string;
        if (typeof(trait) === "string") {
            let iTrait :number;
            traitName = trait;
            trait = undefined;
            iTrait = getTraitRefIndex(this.traits as any, traitName);
            if (iTrait != -1) {
                trait = this.traits[iTrait];
            }
        }

        if (!trait && create) {
            if (simpleRef)
                trait = traitName;
            else 
                trait = Corpus.MakeObject<ICdmTraitRef>(cdmObjectType.traitRef, traitName);
            if (this.hostAtt)
                trait = this.hostAtt.addAppliedTrait(trait, false);
            if (this.hostEnt)
                trait = this.hostEnt.addExhibitedTrait(trait, false);
        }
        return trait as ICdmTraitRef;
    }

    setTraitArgument(trait : string | ICdmTraitRef, argName : string, value : ArgumentValue) {
        trait = this.getTrait(trait, true, false);
        let args = trait.getArgumentDefs();
        if (!args || !args.length) {
            trait.addArgument(argName, value);
            return;
        }

        for(let iArg = 0; iArg < args.length; iArg++) {
            let arg = args[iArg];
            if (arg.getName() == argName) {
                arg.setValue(value);
                return;
            }
        }
        trait.addArgument(argName, value);
    }

    setTraitTable (trait : string | ICdmTraitRef, argName: string, entityName : string, action: (cEnt:ICdmConstantEntityDef, created : boolean)=>void)  {
        //let bodyCode = () =>
        {
            trait = this.getTrait(trait, true, false);
            if (!trait.getArgumentDefs() || !trait.getArgumentDefs().length) {
                // make the argument nothing but a ref to a constant entity, safe since there is only one param for the trait and it looks cleaner
                let cEnt = Corpus.MakeObject<ICdmConstantEntityDef>(cdmObjectType.constantEntityDef);
                cEnt.setEntityShape(Corpus.MakeRef(cdmObjectType.entityRef, entityName, true));
                action(cEnt, true);
                trait.addArgument(argName, Corpus.MakeRef(cdmObjectType.entityRef, cEnt, false));
            }
            else {
                let locEntRef = getTraitRefArgumentValue(trait as ICdmTraitRef, argName);
                if (locEntRef) {
                    let locEnt = locEntRef.getObjectDef(null) as ICdmConstantEntityDef;
                    if (locEnt)
                        action(locEnt, false);
                }
            }
        }
        //return p.measure(bodyCode);
    }

    getTraitTable (trait : string | ICdmTraitRef | ResolvedTrait, argName : string) : ICdmConstantEntityDef  {
        //let bodyCode = () =>
        {
            if (!trait) 
                return undefined;
            if (typeof(trait) === "string") {
                let iTrait :number;
                iTrait = getTraitRefIndex(this.traits as any, trait);
                if (iTrait == -1) 
                    return undefined;
                trait = this.traits[iTrait];
            }

            let locEntRef = getTraitRefArgumentValue(trait, argName);
            if (locEntRef) {
                return locEntRef.getObjectDef(null) as ICdmConstantEntityDef;
            }
        }
        //return p.measure(bodyCode);
    }


    setLocalizedTraitTable (traitName : string, sourceText : string)  {
        //let bodyCode = () =>
        {
            this.setTraitTable(traitName, "localizedDisplayText", "localizedTable", (cEnt : ICdmConstantEntityDef, created : boolean) => {
                if (created)
                    cEnt.setConstantValues([["en", sourceText]]);
                else
                    cEnt.setWhere(null, 1, sourceText, 0, "en");  // need to use ordinals because no binding done yet
            });
        }
        //return p.measure(bodyCode);
    }

    getLocalizedTraitTable (trait : string | ICdmTraitRef)  {
        //let bodyCode = () =>
        {
            let cEnt = this.getTraitTable(trait, "localizedDisplayText")
            if (cEnt)
                return cEnt.lookupWhere(null, 1, 0, "en"); // need to use ordinals because no binding done yet
        }
        //return p.measure(bodyCode);
    }

    setSingleAttTraitTable(trait : string | ICdmTraitRef, argName : string, entityName : string, sourceText : string[]) {
        this.setTraitTable(trait, argName, entityName, (cEnt : ICdmConstantEntityDef, created : boolean) => {
            // turn array of strings into array of array of strings;
            let vals = new Array<Array<string>>();
            sourceText.forEach(v=>{let r = new Array<string>(); r.push(v); vals.push(r)});
            cEnt.setConstantValues(vals);
        });
    }
    getSingleAttTraitTable(trait : string | ICdmTraitRef, argName : string) : string[]{
        let cEnt = this.getTraitTable(trait, argName)
        if (cEnt) {
            // turn array of arrays into single array of strings
            let result = new Array<string>();
            cEnt.getConstantValues().forEach(v=>{ result.push(v[0])});
            return result;
        }
    }

    getDefaultValue() : any {
        let trait = this.getTrait("does.haveDefault", false);
        if (trait) {
            let defVal = getTraitRefArgumentValue(trait as ICdmTraitRef, "default");
            if (typeof(defVal) === "string")
                return defVal;
            if ((defVal as ICdmObject).getObjectType() === cdmObjectType.entityRef) {
                let cEnt = (defVal as ICdmObject).getObjectDef(null) as ICdmConstantEntityDef;
                if (cEnt) {
                    let esName = cEnt.getEntityShape().getObjectDefName();
                    let corr = esName === "listLookupCorrelatedValues";
                    if (esName === "listLookupValues" || corr) {
                        let result = new Array<any>();
                        let rawValues = cEnt.getConstantValues();
                        let l = rawValues.length;
                        for(let i=0; i<l; i++) {
                            let row : any = {};
                            let rawRow = rawValues[i];
                            if ((!corr && rawRow.length == 4) || (corr && rawRow.length == 5)) {
                                row["languageTag"] = rawRow[0];
                                row["displayText"] = rawRow[1];
                                row["attributeValue"] = rawRow[2];
                                row["displayOrder"] = rawRow[3];
                                if (corr)
                                    row["correlatedValue"] = rawRow[4];
                            }
                            result.push(row);
                        }
                        return result;
                    }
                }
            }

            return defVal;
        }
    }

    setDefaultValue(newDefault : any) {
        let trait = this.getTrait("does.haveDefault", true, false);
        if (typeof(newDefault) === "string") {
            newDefault = newDefault;
        }
        else if (newDefault instanceof Array) {
            let a = newDefault as Array<any>;
            let l = a.length;
            if (l && a[0].displayOrder != undefined) {
                // looks like something we understand
                let tab = new Array<Array<string>>();
                let corr = (a[0].correlatedValue != undefined);
                for (let i=0; i<l; i++) {
                    let row = new Array<string>();
                    row.push(a[i].languageTag);
                    row.push(a[i].displayText);
                    row.push(a[i].attributeValue);
                    row.push(a[i].displayOrder);
                    if (corr)
                        row.push(a[i].correlatedValue);
                    tab.push(row);
                }
                let cEnt = Corpus.MakeObject<ICdmConstantEntityDef>(cdmObjectType.constantEntityDef);
                cEnt.setEntityShape(Corpus.MakeRef(cdmObjectType.entityRef, corr ? "listLookupCorrelatedValues" : "listLookupValues", true));
                cEnt.setConstantValues(tab);
                newDefault = Corpus.MakeRef(cdmObjectType.entityRef, cEnt, false);
            }
        }
        this.setTraitArgument(trait, "default", newDefault);
    }

}



////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  friendly format 
//
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

export class friendlyFormatNode
{
    public verticalMode: boolean = false;
    public indentChildren: boolean = true;
    public terminateAfterList: boolean = true;
    public lineWrap: boolean = false;
    public forceWrap: boolean = false;
    public bracketEmpty: boolean = false;
    public starter: string;
    public terminator: string;
    public separator: string;
    public comment: string;
    public leafSource: string;
    public layoutWidth: number = 0;
    public children: friendlyFormatNode[];
    calcStarter: string;
    calcTerminator: string;
    calcPreceedingSeparator: string;
    calcIndentLevel: number;
    calcNLBefore: boolean;
    calcNLAfter: boolean;

    constructor(leafSource?: string)
    {
        this.leafSource = leafSource;
    }
    public addComment(comment: string)
    {
        this.comment = comment;
    }
    public addChild(child: friendlyFormatNode)
    {
        if (!this.children)
            this.children = new Array<friendlyFormatNode>();
        this.children.push(child);
    }

    public addChildString(source: string, quotes: boolean = false)
    {
        if (source) {
            if (quotes)
                source = `"${source}"`;
            this.addChild(new friendlyFormatNode(source));
        }
    }

    public setDelimiters()
    {
        this.calcStarter = "";
        this.calcTerminator = "";
        this.calcPreceedingSeparator = "";
        if (!this.children && !this.leafSource) {
            if (this.bracketEmpty && this.starter && this.terminator) {
                this.calcStarter = this.starter;
                this.calcTerminator = this.terminator;
            }
            return;
        }

        if (this.starter)
            this.calcStarter = this.starter;
        if (this.terminator)
            this.calcTerminator = this.terminator;

        let lChildren = this.children ? this.children.length : 0;
        for (let iChild = 0; iChild < lChildren; iChild++) {
            let child = this.children[iChild];
            child.setDelimiters();
            if (iChild > 0 && this.separator)
                child.calcPreceedingSeparator = this.separator;
        }
    }

    public setWhitespace(indentLevel: number, needsNL: boolean): boolean
    {
        this.calcIndentLevel = indentLevel;
        let lChildren = this.children ? this.children.length : 0;
        let didNL = false;

        if (this.leafSource) {
            this.calcNLBefore = needsNL;
        }
        for (let iChild = 0; iChild < lChildren; iChild++) {
            let child = this.children[iChild];
            if (this.verticalMode)
                needsNL = !didNL;

            didNL = child.setWhitespace(indentLevel + ((this.indentChildren && this.verticalMode) ? 1 : 0), needsNL);

            if (!this.verticalMode)
                needsNL = false;
        }

        if (this.verticalMode) {
            if (needsNL) {
                this.calcNLAfter = true;
                didNL = true;
            }
        }

        return didNL;
    }

    public layout(maxWidth: number, maxMargin: number, start: number, indentWidth: number): [number, number]
    {

        let position = start;
        let firstWrite;

        if (this.calcPreceedingSeparator) {
            firstWrite = position;
            position += this.calcPreceedingSeparator.length;
        }

        if (this.calcStarter) {
            firstWrite = firstWrite != undefined ? firstWrite : position;
            position += this.calcStarter.length;
        }

        if (this.calcNLBefore) {
            position = 0;
            position += this.calcIndentLevel * indentWidth;
            firstWrite = position;
        }

        if (this.children) {
            let lChildren = this.children.length;
            let wrapTo: number;
            for (let iChild = 0; iChild < lChildren; iChild++) {
                let child = this.children[iChild];
                if (iChild > 0 && (this.forceWrap || (this.lineWrap && position + child.layoutWidth > maxWidth))) {
                    child.calcNLBefore = true;
                    child.calcIndentLevel = Math.floor((wrapTo + indentWidth) / indentWidth)
                    position = child.calcIndentLevel * indentWidth;
                }
                let childLayout = child.layout(maxWidth, maxMargin, position, indentWidth);
                position = childLayout["0"];
                if (iChild == 0) {
                    wrapTo = childLayout["1"];
                    firstWrite = firstWrite != undefined ? firstWrite : wrapTo;
                }
            }
        }
        else if (this.leafSource) {
            firstWrite = firstWrite != undefined ? firstWrite : position;
            position += this.leafSource.length;
        }

        if (this.calcNLAfter) {
            position = 0;
            firstWrite = firstWrite != undefined ? firstWrite : position;
        }

        if (this.calcTerminator) {
            if (this.calcNLAfter)
                position += this.calcIndentLevel * indentWidth;
            firstWrite = firstWrite != undefined ? firstWrite : position;
            position += this.calcTerminator.length;
            if (this.calcNLAfter)
                position = 0;
        }

        firstWrite = firstWrite != undefined ? firstWrite : position;
        this.layoutWidth = position - firstWrite;

        return [position, firstWrite];
    }

    lineStart(startIndent: number)
    {
        let line = "";
        while (startIndent) {
            line += " ";
            startIndent--;
        }
        return line;
    }

    public compose(indentWidth: number): string
    {

        let compose: string = "";

        compose += this.calcPreceedingSeparator;

        if (this.calcStarter) {
            compose += this.calcStarter;
        }

        if (this.calcNLBefore) {
            compose += "\n";
            compose += this.lineStart(this.calcIndentLevel * indentWidth);
        }

        if (this.children) {
            let lChildren = this.children.length;
            for (let iChild = 0; iChild < lChildren; iChild++) {
                let child = this.children[iChild];
                compose += child.compose(indentWidth);
            }
        }
        else if (this.leafSource) {
            compose += this.leafSource;
        }

        if (this.calcNLAfter) {
            compose += "\n";
        }

        if (this.calcTerminator) {
            if (this.calcNLAfter)
                compose += this.lineStart(this.calcIndentLevel * indentWidth);
            compose += this.calcTerminator;
            if (this.calcNLAfter)
                compose += "\n";
        }
        return compose;
    }

    public toString(maxWidth: number, maxMargin: number, startIndent: number, indentWidth: number)
    {
        this.setDelimiters();
        this.setWhitespace(0, false);
        this.calcNLBefore = false;
        // layout with a giant maxWidth so that we just measure everything
        this.layout(Number.MAX_SAFE_INTEGER, maxMargin, startIndent, indentWidth);
        // now use the real max
        this.layout(maxWidth, maxMargin, startIndent, indentWidth);
        return this.compose(indentWidth);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  common base class
//  {Object}
//
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

abstract class cdmObject implements ICdmObject
{
    constructor() {
        this.ID = Corpus.nextID();
    }
    public ID : number;
    public abstract copy(wrtDoc: ICdmDocumentDef): ICdmObject
    public abstract getFriendlyFormat(): friendlyFormatNode;
    public abstract validate(): boolean;
    public objectType: cdmObjectType;
    ctx: resolveContext;

    skipElevated = true;

    rtsbAll: ResolvedTraitSetBuilder;
    rtsbElevated: ResolvedTraitSetBuilder;
    rtsbInherited: ResolvedTraitSetBuilder;
    rtsbApplied: ResolvedTraitSetBuilder;

    declaredPath: string;

    public abstract getObjectType(): cdmObjectType;
    public abstract getObjectDefName(): string;
    public abstract getObjectDef<T=ICdmObjectDef>(wrtDoc: ICdmDocumentDef);

    public constructResolvedTraits(rtsb: ResolvedTraitSetBuilder)
    {
        //let bodyCode = () =>
        {
        }
        //return p.measure(bodyCode);
    }
    public constructResolvedAttributes(wrtDoc: ICdmDocumentDef): ResolvedAttributeSetBuilder
    {
        //let bodyCode = () =>
        {
            return null;
        }
        //return p.measure(bodyCode);
    }
   
    public getResolvedTraits(wrtDoc : ICdmDocumentDef, set?: cdmTraitSet): ResolvedTraitSet
    {
        //let bodyCode = () =>
        {
            if (!set)
                set = cdmTraitSet.all;
            if (!this.rtsbInherited && (set == cdmTraitSet.all || set == cdmTraitSet.inheritedOnly)) {
                this.rtsbInherited = new ResolvedTraitSetBuilder(wrtDoc, cdmTraitSet.inheritedOnly);
                this.constructResolvedTraits(this.rtsbInherited);
            }

            if (!this.rtsbApplied && (set == cdmTraitSet.all || set == cdmTraitSet.appliedOnly)) {
                this.rtsbApplied = new ResolvedTraitSetBuilder(wrtDoc, cdmTraitSet.appliedOnly);
                this.constructResolvedTraits(this.rtsbApplied);
            }

            if (!this.skipElevated && !this.rtsbElevated && (set == cdmTraitSet.all || set == cdmTraitSet.elevatedOnly)) {
                this.rtsbElevated = new ResolvedTraitSetBuilder(wrtDoc, cdmTraitSet.elevatedOnly);
                this.constructResolvedTraits(this.rtsbElevated);
            }

            if (!this.rtsbAll && set == cdmTraitSet.all) {
                this.rtsbAll = new ResolvedTraitSetBuilder(wrtDoc, cdmTraitSet.all);
                // applied go after inherited so they can override
                this.rtsbAll.takeReference(this.rtsbInherited.rts);
                if (!this.skipElevated)
                    this.rtsbAll.mergeTraits(this.rtsbElevated.rts);
                this.rtsbAll.mergeTraits(this.rtsbApplied.rts);
            }
            if (set == cdmTraitSet.all)
                return this.rtsbAll.rts;
            if (set == cdmTraitSet.inheritedOnly)
                return this.rtsbInherited.rts;
            if (set == cdmTraitSet.appliedOnly)
                return this.rtsbApplied.rts;
            if (set == cdmTraitSet.elevatedOnly && !this.skipElevated)
                return this.rtsbElevated.rts;
        }
        //return p.measure(bodyCode);
    }
    public setTraitParameterValue(wrtDoc : ICdmDocumentDef, toTrait: ICdmTraitDef, paramName: string, value: ArgumentValue)
    {
        //let bodyCode = () =>
        {
            // causes rtsb to get created
            this.getResolvedTraits(wrtDoc);
            this.rtsbAll.setTraitParameterValue(wrtDoc, toTrait, paramName, value);
        }
        //return p.measure(bodyCode);
    }

    resolvingAttributes: boolean = false;
    public getResolvedAttributes(wrtDoc : ICdmDocumentDef, ): ResolvedAttributeSet
    {
        //let bodyCode = () =>
        {
            let rasbCache = this.ctx.getCache(this, wrtDoc, "rasb") as ResolvedAttributeSetBuilder;
            if (!rasbCache) {
                if (this.resolvingAttributes) {
                    // re-entered this attribute through some kind of self or looping reference.
                    return new ResolvedAttributeSet(wrtDoc);
                }
                this.resolvingAttributes = true;
                rasbCache = this.constructResolvedAttributes(wrtDoc);
                this.resolvingAttributes = false;
                this.ctx.setCache(this, wrtDoc, "rasb", rasbCache);
            }
            return rasbCache.ras;
        }
        //return p.measure(bodyCode);
    }

    clearTraitCache()
    {
        //let bodyCode = () =>
        {
            if (this.rtsbAll)
                this.rtsbAll.clear();
            if (this.rtsbApplied)
                this.rtsbApplied.clear();
            if (this.rtsbElevated)
                this.rtsbElevated.clear();
            if (this.rtsbInherited)
                this.rtsbInherited.clear();
        }
        //return p.measure(bodyCode);
    }


    public abstract copyData(wrtDoc : ICdmDocumentDef, stringRefs?: boolean): any;
    public static copyIdentifierRef(identifier : string, resolved : cdmObjectDef, stringRefs : boolean) : any
    {
        if (!stringRefs)
            return identifier;
        if (!resolved)
            return identifier;
        return {
            corpusPath: resolved.getObjectPath(),
            identifier: identifier
        };
    }
        
    // public toJSON(): any
    // {
    //     //let bodyCode = () =>
    //     {
    //         return this.copyData(false);
    //     }
    //     //return p.measure(bodyCode);
    // }

    public static arraycopyData<T>(wrtDoc : ICdmDocumentDef, source: ICdmObject[], stringRefs?: boolean): Array<T>
    {
        //let bodyCode = () =>
        {
            if (!source)
                return undefined;
            let casted = new Array<T>();
            let l = source.length;
            for (let i = 0; i < l; i++) {
                const element = source[i];
                casted.push(element ? element.copyData(wrtDoc, stringRefs) : undefined);
            }
            return casted;
        }
        //return p.measure(bodyCode);
    }

    public static arrayCopy<T>(wrtDoc:ICdmDocumentDef, source: cdmObject[]): Array<T>
    {
        //let bodyCode = () =>
        {
            if (!source)
                return undefined;
            let casted = new Array<T>();
            let l = source.length;
            for (let i = 0; i < l; i++) {
                const element = source[i];
                casted.push(element ? <any>element.copy(wrtDoc) : undefined);
            }
            return casted;
        }
        //return p.measure(bodyCode);
    }

    public static arrayGetFriendlyFormat(under: friendlyFormatNode, source: cdmObject[])
    {
        //let bodyCode = () =>
        {
            if (!source || source.length == 0) {
                under.lineWrap = false;
                under.forceWrap = false;
                return;
            }
            let l = source.length;
            for (let i = 0; i < l; i++) {
                under.addChild(source[i].getFriendlyFormat());
            }
            if (l == 1) {
                under.lineWrap = false;
                under.forceWrap = false;
            }
        }
        //return p.measure(bodyCode);
    }

    public static createConstant(object: any): ArgumentValue
    {
        //let bodyCode = () =>
        {
            if (!object)
                return undefined;
            if (typeof object === "string")
                return object;
            else if (object.relationship) {
                if (object.dataType)
                    return TypeAttributeImpl.instanceFromData(object);
                else if (object.entity)
                    return EntityAttributeImpl.instanceFromData(object);
                else
                    return null;
            }
            else if (object.relationshipReference)
                return RelationshipReferenceImpl.instanceFromData(object);
            else if (object.traitReference)
                return TraitReferenceImpl.instanceFromData(object);
            else if (object.dataTypeReference)
                return DataTypeReferenceImpl.instanceFromData(object);
            else if (object.entityReference)
                return EntityReferenceImpl.instanceFromData(object);
            else if (object.attributeGroupReference)
                return AttributeGroupReferenceImpl.instanceFromData(object);
            else
                return null;
        }
        //return p.measure(bodyCode);
    }
    public static createDataTypeReference(object: any): DataTypeReferenceImpl
    {
        //let bodyCode = () =>
        {
            if (object)
                return DataTypeReferenceImpl.instanceFromData(object);
            return undefined;
        }
        //return p.measure(bodyCode);
    }
    public static createRelationshipReference(object: any): RelationshipReferenceImpl
    {
        //let bodyCode = () =>
        {
            if (object)
                return RelationshipReferenceImpl.instanceFromData(object);
            return undefined;
        }
        //return p.measure(bodyCode);
    }
    public static createEntityReference(object: any): EntityReferenceImpl
    {
        //let bodyCode = () =>
        {
            if (object)
                return EntityReferenceImpl.instanceFromData(object);
            return undefined;
        }
        //return p.measure(bodyCode);
    }

    public static createAttribute(object: any): (AttributeGroupReferenceImpl | TypeAttributeImpl | EntityAttributeImpl)
    {
        //let bodyCode = () =>
        {
            if (!object)
                return undefined;

            if (typeof object === "string")
                return AttributeGroupReferenceImpl.instanceFromData(object);
            else {
                if (object.attributeGroupReference)
                    return AttributeGroupReferenceImpl.instanceFromData(object);
                else if (object.name)
                    return TypeAttributeImpl.instanceFromData(object);
                else if (object.entity)
                    return EntityAttributeImpl.instanceFromData(object);
            }
        }
        //return p.measure(bodyCode);
    }
    public static createAttributeArray(object: any): (AttributeGroupReferenceImpl | TypeAttributeImpl | EntityAttributeImpl)[]
    {
        //let bodyCode = () =>
        {
            if (!object)
                return undefined;

            let result: (AttributeGroupReferenceImpl | TypeAttributeImpl | EntityAttributeImpl)[];
            result = new Array<AttributeGroupReferenceImpl | TypeAttributeImpl | EntityAttributeImpl>();

            let l = object.length;
            for (let i = 0; i < l; i++) {
                const ea = object[i];
                result.push(cdmObject.createAttribute(ea));
            }
            return result;
        }
        //return p.measure(bodyCode);
    }

    public static createTraitReferenceArray(object: any): TraitReferenceImpl[]
    {
        //let bodyCode = () =>
        {
            if (!object)
                return undefined;

            let result: TraitReferenceImpl[];
            result = new Array<TraitReferenceImpl>();

            let l = object.length;
            for (let i = 0; i < l; i++) {
                const tr = object[i];
                result.push(TraitReferenceImpl.instanceFromData(tr));
            }
            return result;
        }
        //return p.measure(bodyCode);
    }

    public abstract visit(path : string, preChildren: VisitCallback, postChildren: VisitCallback): boolean;
    public static visitArray(items: Array<cdmObject>, path : string, preChildren: VisitCallback, postChildren: VisitCallback): boolean
    {
        //let bodyCode = () =>
        {
            let result: boolean = false;
            if (items) {
                let lItem = items.length;
                for (let iItem = 0; iItem < lItem; iItem++) {
                    let element = items[iItem];
                    if (element) {
                        if (element.visit(path, preChildren, postChildren)) {
                            result = true;
                            break;
                        }
                    }
                }
            }
            return result;
        }
        //return p.measure(bodyCode);
    }
}

// some objects are just to structure other obje
abstract class cdmObjectSimple extends cdmObject {
    public getObjectDefName(): string {
        return undefined;
    }
    public getObjectDef<T=ICdmObjectDef>(wrtDoc: ICdmDocumentDef) {
        return undefined;
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  imports
//
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

export class ImportImpl extends cdmObjectSimple implements ICdmImport
{
    uri: string;
    moniker: string;
    doc: Document;

    constructor(uri: string, moniker: string = undefined)
    {
        super();
        //let bodyCode = () =>
        {
            this.uri = uri;
            this.moniker = moniker ? moniker : undefined;
            this.objectType = cdmObjectType.import;
        }
        //return p.measure(bodyCode);
    }
    public getObjectType(): cdmObjectType
    {
        //let bodyCode = () =>
        {
            return cdmObjectType.import;
        }
        //return p.measure(bodyCode);
    }
    public copyData(wrtDoc : ICdmDocumentDef, stringRefs?: boolean): Import
    {
        //let bodyCode = () =>
        {
            let castedToInterface: Import = { moniker: this.moniker, uri: this.uri };
            return castedToInterface;
        }
        //return p.measure(bodyCode);
    }
    public copy(wrtDoc: ICdmDocumentDef): ICdmObject
    {
        //let bodyCode = () =>
        {
            let copy = new ImportImpl(this.uri, this.moniker);
            copy.ctx = this.ctx;
            copy.doc = this.doc;
            return copy;
        }
        //return p.measure(bodyCode);
    }
    public validate(): boolean
    {
        //let bodyCode = () =>
        {
            return this.uri ? true : false;
        }
        //return p.measure(bodyCode);
    }
    public getFriendlyFormat(): friendlyFormatNode
    {
        //let bodyCode = () =>
        {
            let ff = new friendlyFormatNode();
            ff.separator = " ";
            ff.addChildString("import *");
            ff.addChildString(this.moniker ? "as " + this.moniker : undefined);
            ff.addChildString("from");
            ff.addChildString(`${this.uri}`, true);
            return ff;
        }
        //return p.measure(bodyCode);
    }
    public static instanceFromData(object: any): ImportImpl
    {
        //let bodyCode = () =>
        {
            let imp: ImportImpl = new ImportImpl(object.uri, object.moniker);
            return imp;
        }
        //return p.measure(bodyCode);
    }
    public visit(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean
    {
        //let bodyCode = () =>
        {
            // not much to do
            if (preChildren && preChildren(this, pathFrom))
                return false;
            if (postChildren && postChildren(this, pathFrom))
                return true;
            return false;
        }
        //return p.measure(bodyCode);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  arguments and parameters on traits
//
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
//  {ArgumentDef}
////////////////////////////////////////////////////////////////////////////////////////////////////

export class ArgumentImpl extends cdmObjectSimple implements ICdmArgumentDef
{
    explanation: string;
    name: string;
    value: ArgumentValue;
    resolvedParameter: ICdmParameterDef;

    constructor()
    {
        super();
        //let bodyCode = () =>
        {
            this.objectType = cdmObjectType.argumentDef;
        }
        //return p.measure(bodyCode);
    }

    public getObjectType(): cdmObjectType
    {
        //let bodyCode = () =>
        {
            return cdmObjectType.argumentDef;
        }
        //return p.measure(bodyCode);
    }
    public copyData(wrtDoc:ICdmDocumentDef, stringRefs?: boolean): Argument
    {
        //let bodyCode = () =>
        {
            let val : ArgumentValue;
            if (this.value) {
                if (typeof(this.value) === "string")
                    val = this.value;
                else 
                    val = (<ICdmObject>this.value).copyData(wrtDoc, stringRefs);
            }
            // skip the argument if just a value
            if (!this.name)
                return val as any;

            let castedToInterface: Argument = { explanation: this.explanation, name: this.name, value: val };
            return castedToInterface;
        }
        //return p.measure(bodyCode);
    }
    public copy(wrtDoc: ICdmDocumentDef): ICdmObject
    {
        //let bodyCode = () =>
        {
            let copy = new ArgumentImpl();
            copy.ctx = this.ctx;
            copy.name = this.name;
            if (this.value) {
                if (typeof(this.value) === "string")
                    copy.value = this.value;
                else 
                    copy.value = (<ICdmObject>this.value).copy(wrtDoc);
            }
            copy.resolvedParameter = this.resolvedParameter;
            copy.explanation = this.explanation;
            return copy;
        }
        //return p.measure(bodyCode);
    }
    public validate(): boolean
    {
        //let bodyCode = () =>
        {
            return this.value ? true : false;
        }
        //return p.measure(bodyCode);
    }
    public getFriendlyFormat(): friendlyFormatNode
    {
        //let bodyCode = () =>
        {
            let ff = new friendlyFormatNode();
            ff.separator = ": ";
            ff.addChildString(this.name);
            if (this.value) {
                if (typeof(this.value) === "string")
                    ff.addChildString(this.value);
                else 
                    ff.addChild((this.value as ICdmObject).getFriendlyFormat());
            }
            ff.addComment(this.explanation);
            return ff;
        }
        //return p.measure(bodyCode);
    }
    public static instanceFromData(object: any): ArgumentImpl
    {
        //let bodyCode = () =>
        {

            let c: ArgumentImpl = new ArgumentImpl();

            if (object.value) {
                c.value = cdmObject.createConstant(object.value);
                if (object.name)
                    c.name = object.name;
                if (object.explanation)
                    c.explanation = object.explanation;
            }
            else {
                // not a structured argument, just a thing. try it
                c.value = cdmObject.createConstant(object);
            }
            return c;
        }
        //return p.measure(bodyCode);
    }
    public getExplanation(): string
    {
        //let bodyCode = () =>
        {
            return this.explanation;
        }
        //return p.measure(bodyCode);
    }
    public setExplanation(explanation: string): string
    {
        //let bodyCode = () =>
        {
            this.explanation = explanation;
            return this.explanation;
        }
        //return p.measure(bodyCode);
    }
    public getValue(): ArgumentValue
    {
        //let bodyCode = () =>
        {
            return this.value;
        }
        //return p.measure(bodyCode);
    }
    public setValue(value: ArgumentValue)
    {
        //let bodyCode = () =>
        {
            this.value = value;
        }
        //return p.measure(bodyCode);
    }
    public getName(): string
    {
        //let bodyCode = () =>
        {
            return this.name;
        }
        //return p.measure(bodyCode);
    }
    public getParameterDef(): ICdmParameterDef
    {
        //let bodyCode = () =>
        {
            return this.resolvedParameter;
        }
        //return p.measure(bodyCode);
    }
    public visit(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean
    {
        //let bodyCode = () =>
        {
            let path = this.declaredPath;
            if (!path) {
                path = pathFrom + (this.value ? "value/" : "");
                this.declaredPath = path;
            }
            //trackVisits(path);

            if (preChildren && preChildren(this, path))
                return false;
            if (this.value) {
                if (typeof(this.value) != "string")
                    if ((this.value as ICdmObject).visit(path, preChildren, postChildren))
                        return true;
            }
            if (postChildren && postChildren(this, path))
                return true;
            return false;
        }
        //return p.measure(bodyCode);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//  {ParameterDef}
////////////////////////////////////////////////////////////////////////////////////////////////////
export class ParameterImpl extends cdmObjectSimple implements ICdmParameterDef
{
    explanation: string;
    name: string;
    defaultValue: ArgumentValue;
    required: boolean;
    direction: string;
    dataType: DataTypeReferenceImpl;

    constructor(name: string)
    {
        super();
        //let bodyCode = () =>
        {
            this.name = name;
            this.objectType = cdmObjectType.parameterDef;
        }
        //return p.measure(bodyCode);
    }

    public getObjectType(): cdmObjectType
    {
        //let bodyCode = () =>
        {
            return cdmObjectType.parameterDef;
        }
        //return p.measure(bodyCode);
    }
    public copyData(wrtDoc:ICdmDocumentDef, stringRefs?: boolean): Parameter
    {
        //let bodyCode = () =>
        {
            let defVal : ArgumentValue;
            if (this.defaultValue) {
                if (typeof(this.defaultValue)==="string")
                    defVal = this.defaultValue;
                else
                    defVal = (<ICdmObject> this.defaultValue).copyData(wrtDoc, stringRefs);
            }
            let castedToInterface: Parameter = {
                explanation: this.explanation,
                name: this.name,
                defaultValue: defVal,
                required: this.required,
                direction: this.direction,
                dataType: this.dataType ? this.dataType.copyData(wrtDoc, stringRefs) : undefined
            };
            return castedToInterface;
        }
        //return p.measure(bodyCode);
    }
    public copy(wrtDoc: ICdmDocumentDef): ICdmObject
    {
        //let bodyCode = () =>
        {
            let copy = new ParameterImpl(this.name);
            copy.ctx = this.ctx;

            let defVal : ArgumentValue;
            if (this.defaultValue) {
                if (typeof(this.defaultValue)==="string")
                    defVal = this.defaultValue;
                else
                    defVal = (<ICdmObject> this.defaultValue).copy(wrtDoc);
            }
            copy.explanation = this.explanation;
            copy.defaultValue = defVal;
            copy.required = this.required;
            copy.direction = this.direction;
            copy.dataType = (this.dataType ? this.dataType.copy(wrtDoc) : undefined) as DataTypeReferenceImpl
            return copy;
        }
        //return p.measure(bodyCode);
    }
    public validate(): boolean
    {
        //let bodyCode = () =>
        {
            return this.name ? true : false;
        }
        //return p.measure(bodyCode);
    }
    public getFriendlyFormat(): friendlyFormatNode
    {
        //let bodyCode = () =>
        {
            let ff = new friendlyFormatNode();
            ff.separator = " ";
            ff.addChildString(this.required ? "required" : undefined);
            ff.addChildString(this.direction);
            ff.addChild(this.dataType.getFriendlyFormat());
            ff.addChildString(this.name);
            if (this.defaultValue) {
                ff.addChildString("=");
                if (typeof(this.defaultValue) === "string")
                    ff.addChildString(this.defaultValue);
                else
                    ff.addChild((this.defaultValue as ICdmObject).getFriendlyFormat());
            }
            ff.addComment(this.explanation);
            return ff;
        }
        //return p.measure(bodyCode);
    }

    public static instanceFromData(object: any): ParameterImpl
    {

        //let bodyCode = () =>
        {
            let c: ParameterImpl = new ParameterImpl(object.name);
            c.explanation = object.explanation;
            c.required = object.required ? object.required : false;
            c.direction = object.direction ? object.direction : "in";

            c.defaultValue = cdmObject.createConstant(object.defaultValue);
            c.dataType = cdmObject.createDataTypeReference(object.dataType);

            return c;
        }
        //return p.measure(bodyCode);
    }
    public getExplanation(): string
    {
        //let bodyCode = () =>
        {
            return this.explanation;
        }
        //return p.measure(bodyCode);
    }
    public getName(): string
    {
        //let bodyCode = () =>
        {
            return this.name;
        }
        //return p.measure(bodyCode);
    }
    public getDefaultValue(): ArgumentValue
    {
        //let bodyCode = () =>
        {
            return this.defaultValue;
        }
        //return p.measure(bodyCode);
    }
    public getRequired(): boolean
    {
        //let bodyCode = () =>
        {
            return this.required;
        }
        //return p.measure(bodyCode);
    }
    public getDirection(): string
    {
        //let bodyCode = () =>
        {
            return this.direction;
        }
        //return p.measure(bodyCode);
    }
    public getDataTypeRef(): ICdmDataTypeRef
    {
        //let bodyCode = () =>
        {
            return this.dataType;
        }
        //return p.measure(bodyCode);
    }
    public visit(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean
    {
        //let bodyCode = () =>
        {
            let path = this.declaredPath;
            if (!path) {
                path = pathFrom + this.name;
                this.declaredPath = path;
            }
            //trackVisits(path);

            if (preChildren && preChildren(this, path))
                return false;
            if (this.defaultValue && typeof(this.defaultValue) != "string")
                if ((this.defaultValue as ICdmObject).visit(path + "/defaultValue/", preChildren, postChildren))
                    return true;
            if (this.dataType)
                if (this.dataType.visit(path + "/dataType/", preChildren, postChildren))
                    return true;
            if (postChildren && postChildren(this, path))
                return true;
            return false;
        }
        //return p.measure(bodyCode);
    }
}

let addTraitRef = (collection: Array<TraitReferenceImpl>, traitDefOrRef: ICdmTraitRef | ICdmTraitDef | string, implicitRef: boolean): ICdmTraitRef =>
{
    //let bodyCode = () =>
    {
        if (traitDefOrRef) {
            let tRef : TraitReferenceImpl;
            if ((traitDefOrRef as ICdmObject).getObjectType && (traitDefOrRef as ICdmObject).getObjectType() === cdmObjectType.traitRef)
                // already a ref, just store it
                tRef = traitDefOrRef as TraitReferenceImpl;
            else {
                if (typeof(traitDefOrRef) === "string") 
                    // all we got is a string, so make a trait ref out of it
                    tRef = new TraitReferenceImpl(traitDefOrRef, implicitRef, false);
                else 
                    // must be a trait def, so make a ref 
                    tRef = new TraitReferenceImpl(traitDefOrRef as TraitImpl, false, false)
            }

            collection.push(tRef);
            return tRef;
        }
    }
    //return p.measure(bodyCode);
}

let getTraitRefName = (traitRefOrDef: ICdmTraitRef | ICdmTraitDef | string | ResolvedTrait): string =>
{
    //let bodyCode = () =>
    {
        // lots of things this could be on an unresolved object model, so try them
        if (typeof traitRefOrDef === "string")
            return traitRefOrDef;
        if ((traitRefOrDef as ResolvedTrait).parameterValues)
            return (traitRefOrDef as ResolvedTrait).traitName;

        let ot = (traitRefOrDef as ICdmObject).getObjectType();
        if (ot == cdmObjectType.traitDef)
            return (traitRefOrDef as ICdmTraitDef).getName();
        if (ot == cdmObjectType.traitRef) {
            return (traitRefOrDef as ICdmTraitDef).getObjectDefName();
        }
        return null;
    }
    //return p.measure(bodyCode);
}

let getTraitRefIndex = (collection: Array<(TraitReferenceImpl | ResolvedTrait)>, traitDef: ICdmTraitRef | ICdmTraitDef | string): number =>
{
    //let bodyCode = () =>
    {
        if (!collection)
            return -1;
        let index: number;
        let traitName = getTraitRefName(traitDef);
        index = collection.findIndex(t =>
        {
            return getTraitRefName(t) == traitName;
        });
        return index;
    }
    //return p.measure(bodyCode);
}

let removeTraitRef = (collection: Array<(TraitReferenceImpl)>, traitDef: ICdmTraitRef | ICdmTraitDef | string) =>
{
    //let bodyCode = () =>
    {
        let index: number = getTraitRefIndex(collection, traitDef);
        if (index >= 0)
            collection.splice(index, 1);
    }
    //return p.measure(bodyCode);
}

let getTraitRefArgumentValue = (tr: ICdmTraitRef | ResolvedTrait, argName: string): any =>
{
    //let bodyCode = () =>
    {
        if (tr) {
            let av : ArgumentValue;
            if ((tr as ResolvedTrait).parameterValues)
                av = (tr as ResolvedTrait).parameterValues.getParameterValue(argName).value;
            else 
                av = (tr as ICdmTraitRef).getArgumentValue(argName);
            return av;
        }
    }
    //return p.measure(bodyCode);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  base classes for definitions and references
//
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
//  {ObjectDef}
////////////////////////////////////////////////////////////////////////////////////////////////////

abstract class cdmObjectDef extends cdmObject implements ICdmObjectDef
{
    public explanation: string;
    public exhibitsTraits: TraitReferenceImpl[];
    public corpusPath: string;
    //baseCache : Set<string>;

    constructor(exhibitsTraits: boolean = false)
    {
        super();
        //let bodyCode = () =>
        {
            if (exhibitsTraits)
                this.exhibitsTraits = new Array<TraitReferenceImpl>();
        }
        //return p.measure(bodyCode);
    }
    public abstract getName(): string;
    public abstract isDerivedFrom(wrtDoc : ICdmDocumentDef, base: string): boolean;
    public copyDef(wrtDoc: ICdmDocumentDef, copy: cdmObjectDef)
    {
        //let bodyCode = () =>
        {
            copy.explanation = this.explanation;
            copy.exhibitsTraits = cdmObject.arrayCopy<TraitReferenceImpl>(wrtDoc, this.exhibitsTraits);
        }
        //return p.measure(bodyCode);
    }

    public getFriendlyFormatDef(under: friendlyFormatNode)
    {
        //let bodyCode = () =>
        {
            if (this.exhibitsTraits && this.exhibitsTraits.length) {
                let ff = new friendlyFormatNode();
                ff.separator = " ";
                ff.addChildString("exhibits");
                let ffT = new friendlyFormatNode();
                ffT.separator = ", ";
                ffT.lineWrap = true;
                cdmObject.arrayGetFriendlyFormat(ffT, this.exhibitsTraits);
                ff.addChild(ffT);
                under.addChild(ff);
            }
            under.addComment(this.explanation);
        }
        //return p.measure(bodyCode);
    }

    public getObjectDefName(): string {
        //let bodyCode = () =>
        {
            return this.getName(); 
        }
        //return p.measure(bodyCode);
    }
    public getObjectDef<T=ICdmObjectDef>(wrtDoc: ICdmDocumentDef): T
    {
        //let bodyCode = () =>
        {
            return <any>this;
        }
        //return p.measure(bodyCode);
    }

    public getExplanation(): string
    {
        //let bodyCode = () =>
        {
            return this.explanation;
        }
        //return p.measure(bodyCode);
    }
    public setExplanation(explanation: string): string
    {
        this.explanation = explanation;
        return this.explanation;
    }
    public getExhibitedTraitRefs(): ICdmTraitRef[]
    {
        //let bodyCode = () =>
        {
            return this.exhibitsTraits;
        }
        //return p.measure(bodyCode);
    }
    public addExhibitedTrait(traitDef: ICdmTraitRef | ICdmTraitDef | string, implicitRef: boolean = false): ICdmTraitRef
    {
        //let bodyCode = () =>
        {
            if (!traitDef)
                return null;
            this.clearTraitCache();
            if (!this.exhibitsTraits)
                this.exhibitsTraits = new Array<TraitReferenceImpl>();
            return addTraitRef(this.exhibitsTraits, traitDef, implicitRef);
        }
        //return p.measure(bodyCode);
    }
    public removeExhibitedTrait(traitDef: ICdmTraitRef | ICdmTraitDef | string): ICdmTraitRef
    {
        //let bodyCode = () =>
        {
            if (!traitDef)
                return null;
            this.clearTraitCache();
            if (this.exhibitsTraits)
                removeTraitRef(this.exhibitsTraits, traitDef);
        }
        //return p.measure(bodyCode);
    }
    
    public visitDef(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean
    {
        //let bodyCode = () =>
        {
            if (this.exhibitsTraits)
                if (cdmObject.visitArray(this.exhibitsTraits, pathFrom + "/exhibitsTraits/", preChildren, postChildren))
                    return true;
            return false;
        }
        //return p.measure(bodyCode);
    }

    public isDerivedFromDef(wrtDoc : ICdmDocumentDef, base: ICdmObjectRef, name: string, seek: string): boolean
    {
        //let bodyCode = () =>
        {
            if (seek == name)
                return true;

            let def : ICdmObjectDef;
            if (base && (def = base.getObjectDef(wrtDoc)))
                return def.isDerivedFrom(wrtDoc, seek);
            return false;
        }
        //return p.measure(bodyCode);
    }

    public constructResolvedTraitsDef(base: ICdmObjectRef, rtsb: ResolvedTraitSetBuilder)
    {
        //let bodyCode = () =>
        {
            let set = rtsb.set;
            if (set == cdmTraitSet.inheritedOnly)
                set = cdmTraitSet.all;

            // get from base class first, then see if some are applied to base class on ref then add any traits exhibited by this def
            if (base) {
                // merge in all from base class
                rtsb.mergeTraits(base.getResolvedTraits(rtsb.wrtDoc, set));
            }
            // merge in any that are exhibited by this class
            if (this.exhibitsTraits) {
                this.exhibitsTraits.forEach(et =>
                {
                    rtsb.mergeTraits(et.getResolvedTraits(rtsb.wrtDoc, set));
                });
            }
        }
        //return p.measure(bodyCode);
    }
    public getObjectPath(): string
    {
        //let bodyCode = () =>
        {
            return this.corpusPath;
        }
        //return p.measure(bodyCode);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//  {ObjectRef}
////////////////////////////////////////////////////////////////////////////////////////////////////
export abstract class cdmObjectRef extends cdmObject implements ICdmObjectRef
{
    appliedTraits?: TraitReferenceImpl[];
    namedReference?: string;
    explicitReference?: cdmObjectDef;
    simpleNamedReference?: boolean;
    monikeredDocument?:ICdmDocumentDef;

    constructor(referenceTo : (string | cdmObjectDef), simpleReference : boolean, appliedTraits: boolean)
    {
        super();
        //let bodyCode = () =>
        {
            if (referenceTo) {
                if (typeof(referenceTo) === "string")
                    this.namedReference = referenceTo;
                else
                    this.explicitReference = referenceTo as cdmObjectDef;
            }
            if (simpleReference)
                this.simpleNamedReference = true;
            if (appliedTraits)
                this.appliedTraits = new Array<TraitReferenceImpl>();
        }
        //return p.measure(bodyCode);
    }

    getResolvedReference(wrtDoc : ICdmDocumentDef) : cdmObjectDef {
        //let bodyCode = () =>
        {
            if (this.explicitReference)
                return this.explicitReference;

            // first check for the null document, this gets set if the reference comes up 
            // with an explicit use of a monikered import, so honor that and use it independent of the wrt
            // then check for the wrt doc
            // if neither of these is true, then resolve in the doc context
            // this behavior is modeled after virtual functions and the use of explicit calls to base class methods

            if (!this.ctx)
                return undefined;

            let res:namedReferenceResolution;
            if (this.monikeredDocument)
                wrtDoc = this.monikeredDocument;

            res = this.ctx.getCache(this, wrtDoc, "nameResolve") as namedReferenceResolution;
            if (res) 
                return res.toObjectDef;

            let resAttToken = "/(resolvedAttributes)/";
            let seekResAtt = this.namedReference.indexOf(resAttToken);
            if (seekResAtt >= 0) {
                res = {underCtx : this.ctx, usingDoc : wrtDoc as any};
                let entName = this.namedReference.substring(0, seekResAtt);
                let attName = this.namedReference.slice(seekResAtt + resAttToken.length);
                // get the entity
                // resolveNamedReference expects the current document to be set in the context, so put the wrt doc in there
                let save = this.ctx.currentDoc;
                this.ctx.currentDoc = wrtDoc as any;
                let ent = this.ctx.resolveNamedReference(entName, cdmObjectType.entityDef);
                this.ctx.currentDoc = save;
                if (!ent || ent.toObjectDef.objectType != cdmObjectType.entityDef) {
                    this.ctx.statusRpt(cdmStatusLevel.warning, `unable to resolve an entity named '${entName}' from the reference '${this.namedReference}'`, "");
                    return null;
                }

                // get the resolved attribute
                let ra = ent.toObjectDef.getResolvedAttributes(wrtDoc).get(attName);
                if (ra) 
                    res.toObjectDef = ra.attribute as any;
                else {
                    this.ctx.statusRpt(cdmStatusLevel.warning, `couldn't resolve the attribute promise for '${this.namedReference}'`, "");
                }
            }
            else {
                let save = this.ctx.currentDoc;
                this.ctx.currentDoc = wrtDoc as any;
                res = this.ctx.resolveNamedReference(this.namedReference, cdmObjectType.error);
                this.ctx.currentDoc = save;
            }

            if (res) {
                this.ctx.setCache(this, wrtDoc, "nameResolve", res);
            }
            else {
                if (res) {
                    // for debugging only
                    let save = this.ctx.currentDoc;
                    this.ctx.currentDoc = wrtDoc as any;
                    res = this.ctx.resolveNamedReference(this.namedReference, cdmObjectType.error);
                    this.ctx.currentDoc = save;
                }
                return undefined;
            }

            return res.toObjectDef;
        }
        //return p.measure(bodyCode);
    }

    public copyData(wrtDoc: ICdmDocumentDef, stringRefs : boolean) : any {
        //let bodyCode = () =>
        {
            let copy : any = {};
            if (this.namedReference)
            {
                let identifier = cdmObject.copyIdentifierRef(this.namedReference, this.getResolvedReference(wrtDoc), stringRefs);
                if (this.simpleNamedReference)
                    return identifier;
                let replace = this.copyRefData(wrtDoc, copy, identifier, stringRefs);
                if (replace)
                    copy = replace;
            }
            else if (this.explicitReference) {
                let erCopy = this.explicitReference.copyData(wrtDoc, stringRefs);
                let replace = this.copyRefData(wrtDoc, copy, erCopy, stringRefs);
                if (replace)
                    copy = replace;
            }
            if (this.appliedTraits)
                copy.appliedTraits = cdmObject.arraycopyData<TraitReferenceImpl>(wrtDoc, this.appliedTraits, stringRefs);
            return copy;
        }
        //return p.measure(bodyCode);
    }
    public abstract copyRefData(wrtDoc: ICdmDocumentDef, copy : any, refTo : any, stringRefs: boolean) : any;

    public copy(wrtDoc: ICdmDocumentDef): ICdmObject {
        let copy = this.copyRefObject(wrtDoc, this.namedReference ? this.namedReference : this.explicitReference, this.simpleNamedReference);
        if (this.appliedTraits)
            copy.appliedTraits = cdmObject.arrayCopy<TraitReferenceImpl>(wrtDoc, this.appliedTraits);
        return copy;
    }
    public abstract copyRefObject(wrtDoc: ICdmDocumentDef, refTo : string | cdmObjectDef, simpleReference: boolean): cdmObjectRef;

    public getObjectDefName(): string {
        //let bodyCode = () =>
        {
            if (this.namedReference)
                return this.namedReference;
            if (this.explicitReference)
                return this.explicitReference.getName();
            return undefined; 
        }
        //return p.measure(bodyCode);
    }
    public getObjectDef<T=ICdmObjectDef>(wrtDoc: ICdmDocumentDef): T
    {
        //let bodyCode = () =>
        {
            let def = this.getResolvedReference(wrtDoc) as any;
            if (def)
                return def;
            // let docName = wrtDoc ? wrtDoc.getName() : "<no document>"
            // let refName = this.namedReference ? this.namedReference : "<no id>";
            // return new Proxy({},
            //     {
            //         get: function(target, prop) {
            //             return function() { console.log(`called '${prop.toString()}' on failed reference to '${refName}' using '${docName}'`)};
            //         }
            //     }) as any;

        }
        //return p.measure(bodyCode);
    }

    public setObjectDef(def: ICdmObjectDef): ICdmObjectDef
    {
        //let bodyCode = () =>
        {
            this.explicitReference = def as cdmObjectDef;
            return def;
        }
        //return p.measure(bodyCode);
    }

    public getFriendlyFormat(): friendlyFormatNode
    {
        //let bodyCode = () =>
        {
            let ff = new friendlyFormatNode();
            ff.separator = " ";
            if (this.namedReference)
                ff.addChildString(this.namedReference);
            else 
                ff.addChild(this.explicitReference.getFriendlyFormat());

            if (this.appliedTraits && this.appliedTraits.length) {
                let ffT = new friendlyFormatNode();
                ffT.separator = ", ";
                ffT.lineWrap = true;
                ffT.starter = "[";
                ffT.terminator = "]";
                cdmObject.arrayGetFriendlyFormat(ffT, this.appliedTraits);
                ff.addChild(ffT);
            }
            return ff;
        }
        //return p.measure(bodyCode);
    }

    public getAppliedTraitRefs(): ICdmTraitRef[]
    {
        //let bodyCode = () =>
        {
            return this.appliedTraits;
        }
        //return p.measure(bodyCode);
    }
    public addAppliedTrait(traitDef: ICdmTraitRef | ICdmTraitDef | string, implicitRef: boolean = false): ICdmTraitRef
    {
        //let bodyCode = () =>
        {
            if (!traitDef)
                return null;
            this.clearTraitCache();
            if (!this.appliedTraits)
                this.appliedTraits = new Array<TraitReferenceImpl>();
            return addTraitRef(this.appliedTraits, traitDef, implicitRef);
        }
        //return p.measure(bodyCode);
    }
    public removeAppliedTrait(traitDef: ICdmTraitRef | ICdmTraitDef | string)
    {
        //let bodyCode = () =>
        {
            if (!traitDef)
                return null;
            this.clearTraitCache();
            if (this.appliedTraits)
                removeTraitRef(this.appliedTraits, traitDef);
        }
        //return p.measure(bodyCode);
    }
    public validate(): boolean
    {
        //let bodyCode = () =>
        {
            return (this.namedReference || this.explicitReference) ? true : false;
        }
        //return p.measure(bodyCode);
    }

    public visit(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean
    {
        //let bodyCode = () =>
        {
            let path = this.declaredPath;
            if (!path) {
                if (this.namedReference)
                    path = pathFrom + this.namedReference;
                else 
                    path = pathFrom;
                this.declaredPath = path;
            }
            //trackVisits(path);

            if (preChildren && preChildren(this, path))
                return false;
            if (this.explicitReference)
                if (this.explicitReference.visit(path, preChildren, postChildren))
                    return true;
            if (this.visitRef(path, preChildren, postChildren))
                return true;

            if (this.appliedTraits)
                if (cdmObject.visitArray(this.appliedTraits, path + "/appliedTraits/", preChildren, postChildren))
                    return true;
                
            if (postChildren && postChildren(this, path))
                return true;
            return false;
        }
        //return p.measure(bodyCode);
    }
    public abstract visitRef(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean;

    public constructResolvedAttributes(wrtDoc: ICdmDocumentDef): ResolvedAttributeSetBuilder
    {
        //let bodyCode = () =>
        {
            // find and cache the complete set of attributes
            let rasb = new ResolvedAttributeSetBuilder(wrtDoc);
            let def = this.getObjectDef(wrtDoc);
            if (def) {
                rasb.takeReference(def.getResolvedAttributes(wrtDoc));
                rasb.applyTraits(this.getResolvedTraits(wrtDoc, cdmTraitSet.appliedOnly));
                rasb.removeRequestedAtts();
            }
            return rasb;
        }
        //return p.measure(bodyCode);
    }

    public constructResolvedTraits(rtsb: ResolvedTraitSetBuilder)
    {
        //let bodyCode = () =>
        {
            let set = rtsb.set;
            let objDef = this.getObjectDef(rtsb.wrtDoc);

            if (set == cdmTraitSet.inheritedOnly) {
                if (objDef)
                    rtsb.takeReference(objDef.getResolvedTraits(rtsb.wrtDoc, cdmTraitSet.all));
                return;
            }

            if (set == cdmTraitSet.appliedOnly)
                set = cdmTraitSet.all;

            if (set == cdmTraitSet.elevatedOnly) {
                if (objDef)
                    rtsb.takeReference(objDef.getResolvedTraits(rtsb.wrtDoc, set));
                return;
            }

            if (this.appliedTraits) {
                this.appliedTraits.forEach(at =>
                {
                    rtsb.mergeTraits(at.getResolvedTraits(rtsb.wrtDoc, set));
                });
            }
            rtsb.cleanUp();

        }
        //return p.measure(bodyCode);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  Traits
//
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
//  {TraitRef}
////////////////////////////////////////////////////////////////////////////////////////////////////
export class TraitReferenceImpl extends cdmObjectRef implements ICdmTraitRef
{
    arguments?: ArgumentImpl[];

    constructor(trait: string | TraitImpl, simpleReference: boolean, hasArguments: boolean)
    {
        super(trait, simpleReference, false);
        //let bodyCode = () =>
        {
            if (hasArguments)
                this.arguments = new Array<ArgumentImpl>();
            this.objectType = cdmObjectType.traitRef;
        }
        //return p.measure(bodyCode);
    }
    public getObjectType(): cdmObjectType
    {
        //let bodyCode = () =>
        {
            return cdmObjectType.traitRef;
        }
        //return p.measure(bodyCode);
    }
    public copyRefData(wrtDoc: ICdmDocumentDef, copy : TraitReference, refTo : any, stringRefs: boolean) 
    {
        //let bodyCode = () =>
        {
            copy.traitReference = refTo;
            copy.arguments = cdmObject.arraycopyData<Argument>(wrtDoc, this.arguments, stringRefs)
        }
        //return p.measure(bodyCode);
    }
    public copyRefObject(wrtDoc: ICdmDocumentDef, refTo : string | TraitImpl, simpleReference: boolean): cdmObjectRef
    {
        //let bodyCode = () =>
        {
            let copy = new TraitReferenceImpl(refTo, this.simpleNamedReference, (this.arguments && this.arguments.length > 0));
            copy.ctx = this.ctx;
            copy.arguments = cdmObject.arrayCopy<ArgumentImpl>(wrtDoc, this.arguments);
            return copy;
        }
        //return p.measure(bodyCode);
    }
    public static instanceFromData(object: any): TraitReferenceImpl
    {
        //let bodyCode = () =>
        {
            let simpleReference : boolean = true;
            let trait : string | TraitImpl;
            if (typeof(object) == "string")
                trait = object;
            else {
                simpleReference = false;
                if (typeof(object.traitReference) === "string")
                    trait = object.traitReference;
                else 
                    trait = TraitImpl.instanceFromData(object.traitReference);
            }

            let c: TraitReferenceImpl = new TraitReferenceImpl(trait, simpleReference, object.arguments);
            if (object.arguments) {
                object.arguments.forEach(a => {
                    c.arguments.push(ArgumentImpl.instanceFromData(a));
                });
            }
            return c;
        }
        //return p.measure(bodyCode);
    }

    public visitRef(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean
    {
        //let bodyCode = () =>
        {
            if (this.arguments)
                if (cdmObject.visitArray(this.arguments, pathFrom + "/arguments/", preChildren, postChildren))
                    return true;
            return false;
        }
        //return p.measure(bodyCode);
    }
    public getFriendlyFormat(): friendlyFormatNode
    {
        //let bodyCode = () =>
        {
            let ff = new friendlyFormatNode();
            ff.addChildString(this.getObjectDefName());
            let ffSub = new friendlyFormatNode();
            ffSub.separator = ", ";
            ffSub.lineWrap = true;
            ffSub.starter = "(";
            ffSub.terminator = ")";
            ffSub.bracketEmpty = true;
            cdmObject.arrayGetFriendlyFormat(ffSub, this.arguments);
            ff.addChild(ffSub);
            return ff;
        }
        //return p.measure(bodyCode);
    }

    public getArgumentDefs(): (ICdmArgumentDef)[]
    {
        //let bodyCode = () =>
        {
            return this.arguments;
        }
        //return p.measure(bodyCode);
    }
    public addArgument(name: string, value: ICdmObject): ICdmArgumentDef
    {
        //let bodyCode = () =>
        {
            if (!this.arguments)
                this.arguments = new Array<ArgumentImpl>();
            let newArg = Corpus.MakeObject<ICdmArgumentDef>(cdmObjectType.argumentDef, name);
            newArg.setValue(value);
            this.arguments.push(newArg as any);
            return newArg;
        }
        //return p.measure(bodyCode);
    }
    public getArgumentValue(name: string): ArgumentValue 
    {
        //let bodyCode = () =>
        {
            if (!this.arguments)
                return undefined;
            let iArgSet = 0;
            let lArgSet = this.arguments.length;
            for (iArgSet = 0; iArgSet < lArgSet; iArgSet++) {
                const arg = this.arguments[iArgSet];
                const argName = arg.getName();
                if (argName === name) {
                    return arg.getValue();
                }
                // special case with only one argument and no name give, make a big assumption that this is the one they want
                // right way is to look up parameter def and check name, but this interface is for working on an unresolved def
                if (argName == undefined && lArgSet === 1)
                    return arg.getValue();
            }
        }
        //return p.measure(bodyCode);
    }

    public setArgumentValue(name: string, value: string)
    {
        //let bodyCode = () =>
        {
            if (!this.arguments)
                this.arguments = new Array<ArgumentImpl>();
            let iArgSet = 0;
            for (iArgSet = 0; iArgSet < this.arguments.length; iArgSet++) {
                const arg = this.arguments[iArgSet];
                if (arg.getName() == name) {
                    arg.setValue(value);
                }
            }
            if (iArgSet == this.arguments.length) {
                let arg = new ArgumentImpl();
                arg.ctx = this.ctx;
                arg.name = name;
                arg.value = value;
            }
        }
        //return p.measure(bodyCode);
    }

    public constructResolvedAttributes(wrtDoc: ICdmDocumentDef): ResolvedAttributeSetBuilder
    {
        //let bodyCode = () =>
        {
            return null;
        }
        //return p.measure(bodyCode);
    }
    public constructResolvedTraits(rtsb: ResolvedTraitSetBuilder)
    {
        //let bodyCode = () =>
        {
            let set = rtsb.set;
            if (set != cdmTraitSet.appliedOnly) {
                if (set == cdmTraitSet.inheritedOnly)
                    set = cdmTraitSet.all;

                // get referenced trait
                let trait = this.getObjectDef<ICdmTraitDef>(rtsb.wrtDoc);
                if (trait) {
                    // get the set of resolutions, should just be this one trait
                    rtsb.takeReference(trait.getResolvedTraits(rtsb.wrtDoc, set));
                    // now if there are argument for this application, set the values in the array
                    if (this.arguments) {
                        this.arguments.forEach(a =>
                        {
                            rtsb.setParameterValueFromArgument(trait, a);
                        });
                    }
                }
            }
            rtsb.cleanUp();
        }
        //return p.measure(bodyCode);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//  {TraitDef}
////////////////////////////////////////////////////////////////////////////////////////////////////
export class TraitImpl extends cdmObjectDef implements ICdmTraitDef
{
    explanation: string;
    traitName: string;
    extendsTrait: TraitReferenceImpl;
    hasParameters: ParameterImpl[];
    allParameters: ParameterCollection;
    appliers: traitApplier[];
    hasSetFlags: boolean;
    elevated: boolean;
    modifiesAttributes: boolean;
    ugly: boolean;
    associatedProperties: string[];


    constructor(name: string, extendsTrait: TraitReferenceImpl, hasParameters: boolean = false)
    {
        super();
        //let bodyCode = () =>
        {
            this.hasSetFlags = false;
            this.objectType = cdmObjectType.traitDef;
            this.traitName = name;
            this.extendsTrait = extendsTrait;
            if (hasParameters)
                this.hasParameters = new Array<ParameterImpl>();
        }
        //return p.measure(bodyCode);
    }

    public getObjectType(): cdmObjectType
    {
        //let bodyCode = () =>
        {
            return cdmObjectType.traitDef;
        }
        //return p.measure(bodyCode);
    }
    public copyData(wrtDoc:ICdmDocumentDef, stringRefs?: boolean): Trait
    {
        //let bodyCode = () =>
        {
            let castedToInterface: Trait = {
                explanation: this.explanation,
                traitName: this.traitName,
                extendsTrait: this.extendsTrait ? this.extendsTrait.copyData(wrtDoc, stringRefs) : undefined,
                hasParameters: cdmObject.arraycopyData<string | Parameter>(wrtDoc, this.hasParameters, stringRefs),
                elevated: this.elevated,
                modifiesAttributes: this.modifiesAttributes,
                ugly: this.ugly,
                associatedProperties: this.associatedProperties
            };
            return castedToInterface;
        }
        //return p.measure(bodyCode);
    }
    public copy(wrtDoc: ICdmDocumentDef): ICdmObject
    {
        //let bodyCode = () =>
        {
            let copy = new TraitImpl(this.traitName, null, false);
            copy.ctx = this.ctx;
            copy.extendsTrait = this.extendsTrait ? <TraitReferenceImpl>this.extendsTrait.copy(wrtDoc) : undefined,
            copy.hasParameters = cdmObject.arrayCopy<ParameterImpl>(wrtDoc, this.hasParameters)
            copy.allParameters = null;
            copy.elevated = this.elevated;
            copy.ugly = this.ugly;
            copy.modifiesAttributes = this.modifiesAttributes;
            copy.associatedProperties = this.associatedProperties;
            this.copyDef(wrtDoc, copy);
            return copy;
        }
        //return p.measure(bodyCode);
    }
    public validate(): boolean
    {
        //let bodyCode = () =>
        {
            return this.traitName ? true : false;
        }
        //return p.measure(bodyCode);
    }
    public getFriendlyFormat(): friendlyFormatNode
    {
        //let bodyCode = () =>
        {
            let ff = new friendlyFormatNode();
            ff.separator = " ";
            ff.addChildString("trait");
            ff.addChildString(this.traitName);
            if (this.extendsTrait) {
                ff.addChildString("extends");
                ff.addChild(this.extendsTrait.getFriendlyFormat());
            }
            this.getFriendlyFormatDef(ff);

            if (this.hasParameters) {
                let ffSub = new friendlyFormatNode();
                ffSub.forceWrap = true;
                //ffSub.verticalMode = true;
                ffSub.bracketEmpty = true;
                ffSub.separator = ";";
                ffSub.starter = "{";
                ffSub.terminator = "}";
                cdmObject.arrayGetFriendlyFormat(ffSub, this.hasParameters);
                ff.addChild(ffSub);
            }

            return ff;
        }
        //return p.measure(bodyCode);
    }
    public static instanceFromData(object: any): TraitImpl
    {
        //let bodyCode = () =>
        {
            let extendsTrait: TraitReferenceImpl;
            if (object.extendsTrait)
                extendsTrait = TraitReferenceImpl.instanceFromData(object.extendsTrait);

            let c: TraitImpl = new TraitImpl(object.traitName, extendsTrait, object.hasParameters);

            if (object.explanation)
                c.explanation = object.explanation;

            if (object.hasParameters) {
                object.hasParameters.forEach(ap =>{
                    c.hasParameters.push(ParameterImpl.instanceFromData(ap));
                });
            }

            if (object.elevated != undefined)
                c.elevated = object.elevated;
            if (object.ugly != undefined)
                c.ugly = object.ugly;
            if (object.modifiesAttributes != undefined)
                c.modifiesAttributes = object.modifiesAttributes;
            if (object.associatedProperties)
                c.associatedProperties = object.associatedProperties;
            return c;
        }
        //return p.measure(bodyCode);
    }
    public getExplanation(): string
    {
        //let bodyCode = () =>
        {
            return this.explanation;
        }
        //return p.measure(bodyCode);
    }
    public getName(): string
    {
        //let bodyCode = () =>
        {
            return this.traitName;
        }
        //return p.measure(bodyCode);
    }
    public getExtendsTrait(): ICdmTraitRef
    {
        //let bodyCode = () =>
        {
            return this.extendsTrait;
        }
        //return p.measure(bodyCode);
    }
    public setExtendsTrait(traitDef: ICdmTraitRef | ICdmTraitDef | string, implicitRef: boolean = false): ICdmTraitRef
    {
        //let bodyCode = () =>
        {
            if (!traitDef)
                return null;
            this.clearTraitCache();
            let extRef = new Array<(TraitReferenceImpl)>();
            addTraitRef(extRef, traitDef, implicitRef);
            this.extendsTrait = extRef[0];
            return this.extendsTrait;
        }
        //return p.measure(bodyCode);
    }
    public getHasParameterDefs(): ICdmParameterDef[]
    {
        //let bodyCode = () =>
        {
            return this.hasParameters;
        }
        //return p.measure(bodyCode);
    }
    public getExhibitedTraitRefs(): ICdmTraitRef[]
    {
        //let bodyCode = () =>
        {
            return null;
        }
        //return p.measure(bodyCode);
    }
    public isDerivedFrom(wrtDoc : ICdmDocumentDef, base: string): boolean
    {
        //let bodyCode = () =>
        {
            if (base === this.traitName)
                return true;
            return this.isDerivedFromDef(wrtDoc, this.extendsTrait, this.traitName, base);
        }
        //return p.measure(bodyCode);
    }
    public visit(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean
    {
        //let bodyCode = () =>
        {
            let path = this.declaredPath;
            if (!path) {
                path = pathFrom + this.traitName;
                this.declaredPath = path;
            }
            //trackVisits(path);

            if (preChildren && preChildren(this, path))
                return false;
            if (this.extendsTrait)
                if (this.extendsTrait.visit(path + "/extendsTrait/", preChildren, postChildren))
                    return true;
            if (this.hasParameters)
                if (cdmObject.visitArray(this.hasParameters, path + "/hasParameters/", preChildren, postChildren))
                    return true;
            if (postChildren && postChildren(this, path))
                return true;
            return false;
        }
        //return p.measure(bodyCode);
    }

    public addTraitApplier(applier: traitApplier)
    {
        //let bodyCode = () =>
        {
            if (!this.appliers)
                this.appliers = new Array<traitApplier>();
            this.appliers.push(applier);
        }
        //return p.measure(bodyCode);
    }

    public getTraitAppliers(): traitApplier[]
    {
        //let bodyCode = () =>
        {
            return this.appliers;
        }
        //return p.measure(bodyCode);
    }

    public constructResolvedTraits(rtsb: ResolvedTraitSetBuilder)
    {
        //let bodyCode = () =>
        {
            let set = rtsb.set;
            if (set != cdmTraitSet.appliedOnly) {
                if (set == cdmTraitSet.elevatedOnly && !this.elevated) {
                    // stop now. won't keep these anyway
                    return;
                }

                if (set == cdmTraitSet.inheritedOnly)
                    set = cdmTraitSet.all;
                let baseValues: ArgumentValue[];
                if (this.extendsTrait) {
                    // get the resolution of the base class and use the values as a starting point for this trait's values
                    let base: ResolvedTraitSet = this.extendsTrait.getResolvedTraits(rtsb.wrtDoc, set);
                    if (base)
                        baseValues = base.get(this.extendsTrait.getObjectDef<ICdmTraitDef>(rtsb.wrtDoc)).parameterValues.values;
                    if (this.hasSetFlags == false) {
                        // inherit these flags
                        let baseTrait = this.extendsTrait.getObjectDef<ICdmTraitDef>(rtsb.wrtDoc);
                        if (this.elevated == undefined)
                            this.elevated = baseTrait.elevated;
                        if (this.ugly == undefined)
                            this.ugly = baseTrait.ugly;
                        if (this.modifiesAttributes == undefined)
                            this.modifiesAttributes = baseTrait.modifiesAttributes;
                        if (this.associatedProperties == undefined)
                            this.associatedProperties = baseTrait.associatedProperties;
                    }
                }
                this.hasSetFlags = true;
                let pc = this.getAllParameters(rtsb.wrtDoc);
                let av = new Array<ArgumentValue>();
                for (let i = 0; i < pc.sequence.length; i++) {
                    // either use the default value or (higher precidence) the value taken from the base reference
                    let value: ArgumentValue = (pc.sequence[i] as ParameterImpl).defaultValue;
                    let baseValue: ArgumentValue;
                    if (baseValues && i < baseValues.length) {
                        baseValue = baseValues[i];
                        if (baseValue)
                            value = baseValue;
                    }
                    av.push(value);
                }
                rtsb.ownOne(new ResolvedTrait(this, pc, av));
            }
        }
        //return p.measure(bodyCode);
    }
    public getAllParameters(wrtDoc: ICdmDocumentDef): ParameterCollection
    {
        //let bodyCode = () =>
        {
            if (this.allParameters)
                return this.allParameters;

            // get parameters from base if there is one
            let prior: ParameterCollection;
            if (this.extendsTrait)
                prior = this.getExtendsTrait().getObjectDef<ICdmTraitDef>(wrtDoc).getAllParameters(wrtDoc);
            this.allParameters = new ParameterCollection(prior);
            if (this.hasParameters) {
                this.hasParameters.forEach(element =>
                {
                    this.allParameters.add(element as ICdmParameterDef);
                });
            }

            return this.allParameters;
        }
        //return p.measure(bodyCode);
    }
    public constructResolvedAttributes(wrtDoc: ICdmDocumentDef): ResolvedAttributeSetBuilder
    {
        //let bodyCode = () =>
        {
            return null;
        }
        //return p.measure(bodyCode);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  relationships
//
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
//  {RelationshipRef}
////////////////////////////////////////////////////////////////////////////////////////////////////
export class RelationshipReferenceImpl extends cdmObjectRef
{
    constructor(relationship: string | RelationshipImpl, simpleReference : boolean, appliedTraits: boolean)
    {
        super(relationship, simpleReference, appliedTraits);
        //let bodyCode = () =>
        {
            this.objectType = cdmObjectType.relationshipRef;
        }
        //return p.measure(bodyCode);
    }
    public getObjectType(): cdmObjectType
    {
        //let bodyCode = () =>
        {
            return cdmObjectType.relationshipRef;
        }
        //return p.measure(bodyCode);
    }
    public copyRefData(wrtDoc: ICdmDocumentDef, copy : RelationshipReference, refTo : any, stringRefs: boolean) 
    {
        //let bodyCode = () =>
        {
            copy.relationshipReference = refTo;
        }
        //return p.measure(bodyCode);
    }
    public copyRefObject(wrtDoc: ICdmDocumentDef, refTo : string | RelationshipImpl, simpleReference: boolean): cdmObjectRef
    {
        //let bodyCode = () =>
        {
            let copy = new RelationshipReferenceImpl(refTo, this.simpleNamedReference, (this.appliedTraits && this.appliedTraits.length > 0));
            copy.ctx = this.ctx;
            return copy;
        }
        //return p.measure(bodyCode);
    }

    public static instanceFromData(object: any): RelationshipReferenceImpl
    {
        //let bodyCode = () =>
        {
            let simpleReference : boolean = true;
            let relationship : string | RelationshipImpl;
            if (typeof(object) == "string")
                relationship = object;
            else {
                simpleReference = false;
                if (typeof(object.relationshipReference) === "string")
                    relationship = object.relationshipReference;
                else 
                    relationship = RelationshipImpl.instanceFromData(object.relationshipReference);
            }

            let c: RelationshipReferenceImpl = new RelationshipReferenceImpl(relationship, simpleReference, object.appliedTraits);
            c.appliedTraits = cdmObject.createTraitReferenceArray(object.appliedTraits);

            return c;
        }
        //return p.measure(bodyCode);
    }

    public visitRef(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean
    {
        //let bodyCode = () =>
        {
            return false;
        }
        //return p.measure(bodyCode);
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////
//  {RelationshipDef}
////////////////////////////////////////////////////////////////////////////////////////////////////
export class RelationshipImpl extends cdmObjectDef implements ICdmRelationshipDef
{
    relationshipName: string;
    extendsRelationship?: RelationshipReferenceImpl;

    constructor(relationshipName: string, extendsRelationship: RelationshipReferenceImpl, exhibitsTraits: boolean = false)
    {
        super(exhibitsTraits);
        //let bodyCode = () =>
        {
            this.objectType = cdmObjectType.relationshipDef;
            this.relationshipName = relationshipName;
            if (extendsRelationship)
                this.extendsRelationship = extendsRelationship;
        }
        //return p.measure(bodyCode);
    }
    public getObjectType(): cdmObjectType
    {
        //let bodyCode = () =>
        {
            return cdmObjectType.relationshipDef;
        }
        //return p.measure(bodyCode);
    }
    public copyData(wrtDoc:ICdmDocumentDef, stringRefs?: boolean): Relationship
    {
        //let bodyCode = () =>
        {
            let castedToInterface: Relationship = {
                explanation: this.explanation,
                relationshipName: this.relationshipName,
                extendsRelationship: this.extendsRelationship ? this.extendsRelationship.copyData(wrtDoc, stringRefs) : undefined,
                exhibitsTraits: cdmObject.arraycopyData<string | TraitReference>(wrtDoc, this.exhibitsTraits, stringRefs)
            };
            return castedToInterface;
        }
        //return p.measure(bodyCode);
    }
    public copy(wrtDoc: ICdmDocumentDef): ICdmObject
    {
        //let bodyCode = () =>
        {
            let copy = new RelationshipImpl(this.relationshipName, null, false);
            copy.ctx = this.ctx;
            copy.extendsRelationship = this.extendsRelationship ? <RelationshipReferenceImpl>this.extendsRelationship.copy(wrtDoc) : undefined
            this.copyDef(wrtDoc, copy);
            return copy;
        }
        //return p.measure(bodyCode);
    }
    public validate(): boolean
    {
        return this.relationshipName ? true : false;
    }

    public getFriendlyFormat(): friendlyFormatNode
    {
        //let bodyCode = () =>
        {
            let ff = new friendlyFormatNode();
            ff.separator = " ";
            ff.addChildString("relationship");
            ff.addChildString(this.relationshipName);
            if (this.extendsRelationship) {
                ff.addChildString("extends");
                ff.addChild(this.extendsRelationship.getFriendlyFormat());
            }
            this.getFriendlyFormatDef(ff);
            return ff;
        }
        //return p.measure(bodyCode);
    }
    public static instanceFromData(object: any): RelationshipImpl
    {
        //let bodyCode = () =>
        {
            let extendsRelationship: RelationshipReferenceImpl;
            extendsRelationship = cdmObject.createRelationshipReference(object.extendsRelationship);
            let c: RelationshipImpl = new RelationshipImpl(object.relationshipName, extendsRelationship, object.exhibitsTraits);
            if (object.explanation)
                c.explanation = object.explanation;
            c.exhibitsTraits = cdmObject.createTraitReferenceArray(object.exhibitsTraits);
            return c;
        }
        //return p.measure(bodyCode);
    }
    public getName(): string
    {
        //let bodyCode = () =>
        {
            return this.relationshipName;
        }
        //return p.measure(bodyCode);
    }
    public getExtendsRelationshipRef(): ICdmRelationshipRef
    {
        //let bodyCode = () =>
        {
            return this.extendsRelationship;
        }
        //return p.measure(bodyCode);
    }
    public visit(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean
    {
        //let bodyCode = () =>
        {
            let path = this.declaredPath;
            if (!path) {
                path = pathFrom + this.relationshipName;
                this.declaredPath = path;
            }
            //trackVisits(path);

            if (preChildren && preChildren(this, path))
                return false;
            if (this.extendsRelationship)
                if (this.extendsRelationship.visit(path + "/extendsRelationship/", preChildren, postChildren))
                    return true;
            if (this.visitDef(path, preChildren, postChildren))
                return true;
            if (postChildren && postChildren(this, path))
                return true;
            return false;
        }
        //return p.measure(bodyCode);
    }

    public isDerivedFrom(wrtDoc : ICdmDocumentDef, base: string): boolean
    {
        //let bodyCode = () =>
        {
            return this.isDerivedFromDef(wrtDoc, this.getExtendsRelationshipRef(), this.getName(), base);
        }
        //return p.measure(bodyCode);
    }
    public constructResolvedTraits(rtsb: ResolvedTraitSetBuilder)
    {
        //let bodyCode = () =>
        {
            this.constructResolvedTraitsDef(this.getExtendsRelationshipRef(), rtsb);
            rtsb.cleanUp();
        }
        //return p.measure(bodyCode);
    }

    public constructResolvedAttributes(wrtDoc: ICdmDocumentDef): ResolvedAttributeSetBuilder
    {
        //let bodyCode = () =>
        {
            return null;
        }
        //return p.measure(bodyCode);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  datatypes
//
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
//  {DataTypeRef}
////////////////////////////////////////////////////////////////////////////////////////////////////
export class DataTypeReferenceImpl extends cdmObjectRef
{
    constructor(dataType: string | DataTypeImpl, simpleReference : boolean, appliedTraits: boolean)
    {
        super(dataType, simpleReference, appliedTraits);
        //let bodyCode = () =>
        {
            this.objectType = cdmObjectType.dataTypeRef;
        }
        //return p.measure(bodyCode);
    }
    public getObjectType(): cdmObjectType
    {
        //let bodyCode = () =>
        {
            return cdmObjectType.dataTypeRef;
        }
        //return p.measure(bodyCode);
    }
    public copyRefData(wrtDoc: ICdmDocumentDef, copy : DataTypeReference, refTo : any, stringRefs: boolean) 
    {
        //let bodyCode = () =>
        {
            copy.dataTypeReference = refTo;
        }
        //return p.measure(bodyCode);
    }
    public copyRefObject(wrtDoc: ICdmDocumentDef, refTo : string | DataTypeImpl, simpleReference: boolean): cdmObjectRef
    {
        //let bodyCode = () =>
        {
            let copy = new DataTypeReferenceImpl(refTo, this.simpleNamedReference, (this.appliedTraits && this.appliedTraits.length > 0));
            copy.ctx = this.ctx;
            return copy;
        }
        //return p.measure(bodyCode);
    }

    public static instanceFromData(object: any): DataTypeReferenceImpl
    {
        //let bodyCode = () =>
        {
            let simpleReference : boolean = true;
            let dataType : string | DataTypeImpl;
            if (typeof(object) == "string")
                dataType = object;
            else {
                simpleReference = false;
                if (typeof(object.dataTypeReference) === "string")
                    dataType = object.dataTypeReference;
                else 
                    dataType = DataTypeImpl.instanceFromData(object.dataTypeReference);
            }

            let c: DataTypeReferenceImpl = new DataTypeReferenceImpl(dataType, simpleReference, object.appliedTraits);
            c.appliedTraits = cdmObject.createTraitReferenceArray(object.appliedTraits);

            return c;
        }
        //return p.measure(bodyCode);
    }

    public visitRef(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean
    {
        //let bodyCode = () =>
        {
            return false;
        }
        //return p.measure(bodyCode);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//  {DataTypeDef}
////////////////////////////////////////////////////////////////////////////////////////////////////
export class DataTypeImpl extends cdmObjectDef implements ICdmDataTypeDef
{
    dataTypeName: string;
    extendsDataType?: DataTypeReferenceImpl;

    constructor(dataTypeName: string, extendsDataType: DataTypeReferenceImpl, exhibitsTraits: boolean = false)
    {
        super(exhibitsTraits);
        //let bodyCode = () =>
        {
            this.objectType = cdmObjectType.dataTypeDef;
            this.dataTypeName = dataTypeName;
            this.extendsDataType = extendsDataType;
        }
        //return p.measure(bodyCode);
    }
    public getObjectType(): cdmObjectType
    {
        //let bodyCode = () =>
        {
            return cdmObjectType.dataTypeDef;
        }
        //return p.measure(bodyCode);
    }
    public copyData(wrtDoc:ICdmDocumentDef, stringRefs?: boolean): DataType
    {
        //let bodyCode = () =>
        {
            let castedToInterface: DataType = {
                explanation: this.explanation,
                dataTypeName: this.dataTypeName,
                extendsDataType: this.extendsDataType ? this.extendsDataType.copyData(wrtDoc, stringRefs) : undefined,
                exhibitsTraits: cdmObject.arraycopyData<string | TraitReference>(wrtDoc, this.exhibitsTraits, stringRefs)
            };
            return castedToInterface;
        }
        //return p.measure(bodyCode);
    }
    public copy(wrtDoc: ICdmDocumentDef): ICdmObject
    {
        //let bodyCode = () =>
        {
            let copy = new DataTypeImpl(this.dataTypeName, null, false);
            copy.ctx = this.ctx;
            copy.extendsDataType = this.extendsDataType ? <DataTypeReferenceImpl>this.extendsDataType.copy(wrtDoc) : undefined
            this.copyDef(wrtDoc, copy);
            return copy;
        }
        //return p.measure(bodyCode);
    }
    public validate(): boolean
    {
        //let bodyCode = () =>
        {
            return this.dataTypeName ? true : false;
        }
        //return p.measure(bodyCode);
    }
    public getFriendlyFormat(): friendlyFormatNode
    {
        //let bodyCode = () =>
        {
            let ff = new friendlyFormatNode();
            ff.separator = " ";
            ff.addChildString("dataType");
            ff.addChildString(this.dataTypeName);
            if (this.extendsDataType) {
                ff.addChildString("extends");
                ff.addChild(this.extendsDataType.getFriendlyFormat());
            }
            this.getFriendlyFormatDef(ff);
            return ff;
        }
        //return p.measure(bodyCode);
    }
    public static instanceFromData(object: any): DataTypeImpl
    {
        //let bodyCode = () =>
        {
            let extendsDataType: DataTypeReferenceImpl;
            extendsDataType = cdmObject.createDataTypeReference(object.extendsDataType);

            let c: DataTypeImpl = new DataTypeImpl(object.dataTypeName, extendsDataType, object.exhibitsTraits);

            if (object.explanation)
                c.explanation = object.explanation;

            c.exhibitsTraits = cdmObject.createTraitReferenceArray(object.exhibitsTraits);

            return c;
        }
        //return p.measure(bodyCode);
    }
    public getName(): string
    {
        //let bodyCode = () =>
        {
            return this.dataTypeName;
        }
        //return p.measure(bodyCode);
    }
    public getExtendsDataTypeRef(): ICdmDataTypeRef
    {
        //let bodyCode = () =>
        {
            return this.extendsDataType;
        }
        //return p.measure(bodyCode);
    }
    public visit(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean
    {
        //let bodyCode = () =>
        {
            let path = this.declaredPath;
            if (!path) {
                path = pathFrom + this.dataTypeName;
                this.declaredPath = path;
            }
            //trackVisits(path);

            if (preChildren && preChildren(this, path))
                return false;
            if (this.extendsDataType)
                if (this.extendsDataType.visit(path + "/extendsDataType/", preChildren, postChildren))
                    return true;
            if (this.visitDef(path, preChildren, postChildren))
                return true;
            if (postChildren && postChildren(this, path))
                return true;
            return false;
        }
        //return p.measure(bodyCode);
    }

    public isDerivedFrom(wrtDoc : ICdmDocumentDef, base: string): boolean
    {
        //let bodyCode = () =>
        {
            return this.isDerivedFromDef(wrtDoc, this.getExtendsDataTypeRef(), this.getName(), base);
        }
        //return p.measure(bodyCode);
    }
    public constructResolvedTraits(rtsb: ResolvedTraitSetBuilder)
    {
        //let bodyCode = () =>
        {
            this.constructResolvedTraitsDef(this.getExtendsDataTypeRef(), rtsb);
            rtsb.cleanUp();
        }
        //return p.measure(bodyCode);
    }
    public constructResolvedAttributes(wrtDoc: ICdmDocumentDef): ResolvedAttributeSetBuilder
    {
        //let bodyCode = () =>
        {
            return null;
        }
        //return p.measure(bodyCode);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  attributes
//
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////
//  attribute references. only used internally, so not persisted except as simple string refs
// 
////////////////////////////////////////////////////////////////////////////////////////////////////

export class AttributeReferenceImpl extends cdmObjectRef
{
    constructor(attribute: string | AttributeImpl, simpleReference : boolean)
    {
        super(attribute, simpleReference, false);
        //let bodyCode = () =>
        {
            this.objectType = cdmObjectType.attributeRef;
        }
        //return p.measure(bodyCode);
    }
    public getObjectType(): cdmObjectType
    {
        //let bodyCode = () =>
        {
            return cdmObjectType.attributeRef;
        }
        //return p.measure(bodyCode);
    }
    public copyRefData(wrtDoc: ICdmDocumentDef, copy : AttributeImpl, refTo : any, stringRefs: boolean) 
    {
        //let bodyCode = () =>
        {
            // there is no persisted object wrapper
            return refTo;
        }
        //return p.measure(bodyCode);
    }
    public copyRefObject(wrtDoc: ICdmDocumentDef, refTo : string | AttributeImpl, simpleReference: boolean): cdmObjectRef
    {
        //let bodyCode = () =>
        {
            let copy = new AttributeReferenceImpl(refTo, this.simpleNamedReference);
            copy.ctx = this.ctx;
            return copy;
        }
        //return p.measure(bodyCode);
    }

    public static instanceFromData(object: any): AttributeReferenceImpl
    {
        //let bodyCode = () =>
        {
            let simpleReference : boolean = true;
            let attribute : string | AttributeImpl;
            if (typeof(object) == "string")
                attribute = object;
            else {
                simpleReference = false;
                attribute = cdmObject.createAttribute(object) as AttributeImpl;
            }

            let c: AttributeReferenceImpl = new AttributeReferenceImpl(attribute, simpleReference);
            return c;
        }
        //return p.measure(bodyCode);
    }

    public visitRef(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean
    {
        //let bodyCode = () =>
        {
            return false;
        }
        //return p.measure(bodyCode);
    }

    isAmbiguousButDifferentFrom(wrtDoc: ICdmDocumentDef, otherAtt : ICdmObject) {
        // true if this is a resolved referened to a different attribute when using "this"
        if (this.namedReference && this.namedReference === "this.attribute") {
            let res = this.ctx.getCache(this, null, "nameResolve") as namedReferenceResolution;
            if (!res)
                res = this.ctx.getCache(this, wrtDoc, "nameResolve") as namedReferenceResolution;
            if (res && res.toObjectDef != otherAtt)
                return true;
        }
        return false;
    }

}


////////////////////////////////////////////////////////////////////////////////////////////////////
//  {AttributeDef}
////////////////////////////////////////////////////////////////////////////////////////////////////
export abstract class AttributeImpl extends cdmObjectDef implements ICdmAttributeDef
{
    relationship: RelationshipReferenceImpl;
    appliedTraits?: TraitReferenceImpl[];

    constructor(appliedTraits: boolean = false)
    {
        super();
        //let bodyCode = () =>
        {
            if (appliedTraits)
                this.appliedTraits = new Array<TraitReferenceImpl>();
        }
        //return p.measure(bodyCode);
    }

    public copyAtt(wrtDoc: ICdmDocumentDef, copy: AttributeImpl)
    {
        //let bodyCode = () =>
        {
            copy.relationship = this.relationship ? <RelationshipReferenceImpl>this.relationship.copy(wrtDoc) : undefined;
            copy.appliedTraits = cdmObject.arrayCopy<TraitReferenceImpl>(wrtDoc, this.appliedTraits);
            this.copyDef(wrtDoc, copy);
            return copy;
        }
        //return p.measure(bodyCode);
    }
    public setObjectDef(def: ICdmObjectDef): ICdmObjectDef
    {
        //let bodyCode = () =>
        {
            throw Error("not a ref");
        }
        //return p.measure(bodyCode);
    }
    public getRelationshipRef(): ICdmRelationshipRef
    {
        //let bodyCode = () =>
        {
            return this.relationship;
        }
        //return p.measure(bodyCode);
    }
    public setRelationshipRef(relRef: ICdmRelationshipRef): ICdmRelationshipRef
    {
        //let bodyCode = () =>
        {
            this.relationship = relRef as any;
            return this.relationship;
        }
        //return p.measure(bodyCode);
    }
    public getAppliedTraitRefs(): ICdmTraitRef[]
    {
        //let bodyCode = () =>
        {
            return this.appliedTraits;
        }
        //return p.measure(bodyCode);
    }
    public addAppliedTrait(traitDef: ICdmTraitRef | ICdmTraitDef | string, implicitRef: boolean = false): ICdmTraitRef
    {
        //let bodyCode = () =>
        {
            if (!traitDef)
                return null;
            this.clearTraitCache();
            if (!this.appliedTraits)
                this.appliedTraits = new Array<TraitReferenceImpl>();
            return addTraitRef(this.appliedTraits, traitDef, implicitRef);
        }
        //return p.measure(bodyCode);
    }
    public removeAppliedTrait(traitDef: ICdmTraitRef | ICdmTraitDef | string)
    {
        //let bodyCode = () =>
        {
            if (!traitDef)
                return null;
            this.clearTraitCache();
            if (this.appliedTraits)
                removeTraitRef(this.appliedTraits, traitDef);
        }
        //return p.measure(bodyCode);
    }

    public visitAtt(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean
    {
        //let bodyCode = () =>
        {
            if (this.relationship)
                if (this.relationship.visit(pathFrom + "/relationship/", preChildren, postChildren))
                    return true;
            if (this.appliedTraits)
                if (cdmObject.visitArray(this.appliedTraits, pathFrom + "/appliedTraits/", preChildren, postChildren))
                    return true;
            if (this.visitDef(pathFrom, preChildren, postChildren))
                return true;
            return false;
        }
        //return p.measure(bodyCode);
    }

    public addResolvedTraitsApplied(rtsb: ResolvedTraitSetBuilder): ResolvedTraitSet
    {
        //let bodyCode = () =>
        {

            let set = rtsb.set;
            let addAppliedTraits = (ats: ICdmTraitRef[]) =>
            {
                if (ats) {
                    let l = ats.length;
                    for (let i = 0; i < l; i++) {
                        rtsb.mergeTraits(ats[i].getResolvedTraits(rtsb.wrtDoc, cdmTraitSet.all));
                    }
                }
            };

            addAppliedTraits(this.appliedTraits);
            // any applied on use
            return rtsb.rts;

        }
        //return p.measure(bodyCode);
    }

    public removeTraitDef(wrtDoc: ICdmDocumentDef, def: ICdmTraitDef)
    {
        //let bodyCode = () =>
        {
            this.clearTraitCache();
            let traitName = def.getName();
            if (this.appliedTraits) {
                let iRemove = 0
                for (iRemove = 0; iRemove < this.appliedTraits.length; iRemove++) {
                    const tr = this.appliedTraits[iRemove];
                    if (tr.getObjectDef(wrtDoc).getName() == traitName)
                        break;
                }
                if (iRemove < this.appliedTraits.length) {
                    this.appliedTraits.splice(iRemove, 1);
                    return;
                }
            }
        }
        //return p.measure(bodyCode);
    }
    abstract getResolvedEntityReferences(wrtDoc : ICdmDocumentDef): ResolvedEntityReferenceSet;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//  {TypeAttributeDef}
////////////////////////////////////////////////////////////////////////////////////////////////////
export class TypeAttributeImpl extends AttributeImpl implements ICdmTypeAttributeDef
{
    name: string;
    dataType: DataTypeReferenceImpl;
    t2pm: traitToPropertyMap;

    constructor(name: string, appliedTraits: boolean = false)
    {
        super(appliedTraits);
        //let bodyCode = () =>
        {
            this.objectType = cdmObjectType.typeAttributeDef;
            this.name = name;
        }
        //return p.measure(bodyCode);
    }
    public getObjectType(): cdmObjectType
    {
        //let bodyCode = () =>
        {
            return cdmObjectType.typeAttributeDef;
        }
        //return p.measure(bodyCode);
    }
    public copyData(wrtDoc:ICdmDocumentDef, stringRefs?: boolean): TypeAttribute
    {
        //let bodyCode = () =>
        {
            let castedToInterface: TypeAttribute = {
                explanation: this.explanation,
                name: this.name,
                relationship: this.relationship ? this.relationship.copyData(wrtDoc, stringRefs) : undefined,
                dataType: this.dataType ? this.dataType.copyData(wrtDoc, stringRefs) : undefined,
                appliedTraits: cdmObject.arraycopyData<string | TraitReference>(wrtDoc, this.appliedTraits, stringRefs)
            };
            this.getTraitToPropertyMap().persistForTypeAttributeDef(castedToInterface);
            return castedToInterface;
        }
        //return p.measure(bodyCode);
    }
    public copy(wrtDoc: ICdmDocumentDef): ICdmObject
    {
        //let bodyCode = () =>
        {
            let copy = new TypeAttributeImpl(this.name, false);
            copy.ctx = this.ctx;
            copy.dataType = this.dataType ? <DataTypeReferenceImpl>this.dataType.copy(wrtDoc) : undefined;
            this.copyAtt(wrtDoc, copy);
            return copy;
        }
        //return p.measure(bodyCode);
    }
    public validate(): boolean
    {
        //let bodyCode = () =>
        {
            return this.relationship && this.name && this.dataType ? true : false;
        }
        //return p.measure(bodyCode);
    }

    public getFriendlyFormat(): friendlyFormatNode
    {
        //let bodyCode = () =>
        {
            let ff = new friendlyFormatNode();
            ff.separator = " ";
            ff.addComment(this.explanation);
            ff.addChild(this.relationship.getFriendlyFormat());
            ff.addChild(this.dataType.getFriendlyFormat());
            ff.addChildString(this.name);
            if (this.appliedTraits && this.appliedTraits.length) {
                let ffSub = new friendlyFormatNode();
                ffSub.separator = ", ";
                ffSub.starter = "[";
                ffSub.terminator = "]";
                ffSub.lineWrap = true;
                cdmObject.arrayGetFriendlyFormat(ffSub, this.appliedTraits);
                ff.addChild(ffSub);
            }
            return ff;
        }
        //return p.measure(bodyCode);
    }
    public static instanceFromData(object: any): TypeAttributeImpl
    {
        //let bodyCode = () =>
        {
            let c: TypeAttributeImpl = new TypeAttributeImpl(object.name, object.appliedTraits);

            if (object.explanation)
                c.explanation = object.explanation;

            c.relationship = cdmObject.createRelationshipReference(object.relationship);
            c.dataType = cdmObject.createDataTypeReference(object.dataType);
            c.appliedTraits = cdmObject.createTraitReferenceArray(object.appliedTraits);
            c.t2pm = new traitToPropertyMap();
            c.t2pm.initForTypeAttributeDef(object as TypeAttribute, c);
            return c;
        }
        //return p.measure(bodyCode);
    }
    public isDerivedFrom(wrtDoc : ICdmDocumentDef, base: string): boolean
    {
        //let bodyCode = () =>
        {
            return false;
        }
        //return p.measure(bodyCode);
    }
    public getName(): string
    {
        //let bodyCode = () =>
        {
            return this.name;
        }
        //return p.measure(bodyCode);
    }
    public getDataTypeRef(): ICdmDataTypeRef
    {
        //let bodyCode = () =>
        {
            return this.dataType;
        }
        //return p.measure(bodyCode);
    }
    public setDataTypeRef(dataType: ICdmDataTypeRef): ICdmDataTypeRef
    {
        //let bodyCode = () =>
        {
            this.dataType = dataType as any;
            return this.dataType;
        }
        //return p.measure(bodyCode);
    }

    getTraitToPropertyMap()
    {
        if (this.t2pm)
            return this.t2pm;
        this.t2pm = new traitToPropertyMap();
        this.t2pm.initForTypeAttributeDef(null, this);
        return this.t2pm;
    }
    public get isReadOnly() : boolean
    {
        return this.getTraitToPropertyMap().getPropertyValue("isReadOnly");
    }
    public set isReadOnly(val: boolean)
    {
        this.getTraitToPropertyMap().setPropertyValue("isReadOnly", val);
    }
    public get isNullable() : boolean
    {
        return this.getTraitToPropertyMap().getPropertyValue("isNullable");
    }
    public set isNullable(val: boolean)
    {
        this.getTraitToPropertyMap().setPropertyValue("isNullable", val);
    }
    public get sourceName() : string
    {
        return this.getTraitToPropertyMap().getPropertyValue("sourceName");
    }
    public set sourceName(val: string)
    {
        this.getTraitToPropertyMap().setPropertyValue("sourceName", val);
    }
    public get description() : string
    {
        return this.getTraitToPropertyMap().getPropertyValue("description");
    }
    public set description(val: string)
    {
        this.getTraitToPropertyMap().setPropertyValue("description", val);
    }
    public get displayName() : string
    {
        return this.getTraitToPropertyMap().getPropertyValue("displayName");
    }
    public set displayName(val: string)
    {
        this.getTraitToPropertyMap().setPropertyValue("displayName", val);
    }
    public get sourceOrdering() : number
    {
        return this.getTraitToPropertyMap().getPropertyValue("sourceOrdering");
    }
    public set sourceOrdering(val: number)
    {
        this.getTraitToPropertyMap().setPropertyValue("sourceOrdering", val);
    }
    public get valueConstrainedToList() : boolean
    {
        return this.getTraitToPropertyMap().getPropertyValue("valueConstrainedToList");
    }
    public set valueConstrainedToList(val: boolean)
    {
        this.getTraitToPropertyMap().setPropertyValue("valueConstrainedToList", val);
    }
    public get isPrimaryKey() : boolean
    {
        return this.getTraitToPropertyMap().getPropertyValue("isPrimaryKey");
    }
    public set isPrimaryKey(val: boolean)
    {
        this.getTraitToPropertyMap().setPropertyValue("isPrimaryKey", val);
    }
    public get maximumLength() : number
    {
        return this.getTraitToPropertyMap().getPropertyValue("maximumLength");
    }
    public set maximumLength(val: number)
    {
        this.getTraitToPropertyMap().setPropertyValue("maximumLength", val);
    }
    public get maximumValue() : string
    {
        return this.getTraitToPropertyMap().getPropertyValue("maximumValue");
    }
    public set maximumValue(val: string)
    {
        this.getTraitToPropertyMap().setPropertyValue("maximumValue", val);
    }
    public get minimumValue() : string
    {
        return this.getTraitToPropertyMap().getPropertyValue("minimumValue");
    }
    public set minimumValue(val: string)
    {
        this.getTraitToPropertyMap().setPropertyValue("minimumValue", val);
    }
    public get dataFormat() : string
    {
        return this.getTraitToPropertyMap().getPropertyValue("dataFormat");
    }
    public set dataFormat(val: string)
    {
        this.getTraitToPropertyMap().setPropertyValue("dataFormat", val);
    }
    public get defaultValue() : string
    {
        return this.getTraitToPropertyMap().getPropertyValue("defaultValue");
    }
    public set defaultValue(val: string)
    {
        this.getTraitToPropertyMap().setPropertyValue("defaultValue", val);
    }

    public visit(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean
    {
        //let bodyCode = () =>
        {
            let path = this.declaredPath;
            if (!path) {
                path = pathFrom + this.name;
                this.declaredPath = path;
            }
            //trackVisits(path);

            if (preChildren && preChildren(this, path))
                return false;
            if (this.dataType)
                if (this.dataType.visit(path + "/dataType/", preChildren, postChildren))
                    return true;
            if (this.visitAtt(path, preChildren, postChildren))
                return true;
            if (postChildren && postChildren(this, path))
                return true;
            return false;
        }
        //return p.measure(bodyCode);
    }

    public constructResolvedTraits(rtsb: ResolvedTraitSetBuilder)
    {
        //let bodyCode = () =>
        {
            let set = rtsb.set;
            if (set == cdmTraitSet.inheritedOnly || set == cdmTraitSet.elevatedOnly) {
                if (set == cdmTraitSet.inheritedOnly)
                    set = cdmTraitSet.all;
                // // get from datatype
                if (this.dataType)
                    rtsb.takeReference(this.getDataTypeRef().getResolvedTraits(rtsb.wrtDoc, set));
                // // get from relationship
                if (this.relationship)
                    rtsb.mergeTraits(this.getRelationshipRef().getResolvedTraits(rtsb.wrtDoc, set));
            }

            if (set == cdmTraitSet.appliedOnly || set == cdmTraitSet.elevatedOnly) {
                if (set == cdmTraitSet.appliedOnly)
                    set = cdmTraitSet.all;
                this.addResolvedTraitsApplied(rtsb);
            }
            rtsb.cleanUp();
        }
        //return p.measure(bodyCode);
    }

    public constructResolvedAttributes(wrtDoc: ICdmDocumentDef): ResolvedAttributeSetBuilder
    {
        //let bodyCode = () =>
        {
            // find and cache the complete set of attributes
            // attributes definitions originate from and then get modified by subsequent re-defintions from (in this order):
            // the datatype used as an attribute, traits applied to that datatype,
            // the relationship of the attribute, any traits applied to the attribute.
            let rasb = new ResolvedAttributeSetBuilder(wrtDoc);

            // add this attribute to the set
            // make a new one and apply any traits
            let newAtt = new ResolvedAttribute(wrtDoc, this);
            rasb.ownOne(newAtt);
            rasb.applyTraits(this.getResolvedTraits(wrtDoc, cdmTraitSet.all));

            // from the traits of the datatype, relationship and applied here, see if new attributes get generated
            rasb.mergeTraitAttributes(this.getResolvedTraits(wrtDoc, cdmTraitSet.all));

            return rasb;
        }
        //return p.measure(bodyCode);
    }
    public getResolvedEntityReferences(wrtDoc : ICdmDocumentDef): ResolvedEntityReferenceSet
    {
        //let bodyCode = () =>
        {
            return null;
        }
        //return p.measure(bodyCode);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//  {EntityAttributeDef}
////////////////////////////////////////////////////////////////////////////////////////////////////
export class EntityAttributeImpl extends AttributeImpl implements ICdmEntityAttributeDef
{
    relationship: RelationshipReferenceImpl;
    entity: (EntityReferenceImpl | EntityReferenceImpl[]);
    appliedTraits?: TraitReferenceImpl[];

    constructor(appliedTraits: boolean = false)
    {
        super(appliedTraits);
        //let bodyCode = () =>
        {
            this.objectType = cdmObjectType.entityAttributeDef;
        }
        //return p.measure(bodyCode);
    }
    public getObjectType(): cdmObjectType
    {
        //let bodyCode = () =>
        {
            return cdmObjectType.typeAttributeDef;
        }
        //return p.measure(bodyCode);
    }
    public isDerivedFrom(wrtDoc : ICdmDocumentDef, base: string): boolean
    {
        //let bodyCode = () =>
        {
            return false;
        }
        //return p.measure(bodyCode);
    }
    public copyData(wrtDoc:ICdmDocumentDef, stringRefs?: boolean): EntityAttribute
    {
        //let bodyCode = () =>
        {
            let entity: (string | EntityReference | ((string | EntityReference)[]));
            if (this.entity instanceof Array)
                entity = cdmObject.arraycopyData<(string | EntityReference)>(wrtDoc, this.entity, stringRefs);
            else
                entity = this.entity ? this.entity.copyData(wrtDoc, stringRefs) : undefined;

            let castedToInterface: EntityAttribute = {
                explanation: this.explanation,
                relationship: this.relationship ? this.relationship.copyData(wrtDoc, stringRefs) : undefined,
                entity: entity,
                appliedTraits: cdmObject.arraycopyData<string | TraitReference>(wrtDoc, this.appliedTraits, stringRefs)
            };
            return castedToInterface;
        }
        //return p.measure(bodyCode);
    }
    public copy(wrtDoc: ICdmDocumentDef): ICdmObject
    {
        //let bodyCode = () =>
        {
            let copy = new EntityAttributeImpl(false);
            copy.ctx = this.ctx;
            if (this.entity instanceof Array)
                copy.entity = cdmObject.arrayCopy<EntityReferenceImpl>(wrtDoc, this.entity);
            else
                copy.entity = <EntityReferenceImpl>this.entity.copy(wrtDoc);
            this.copyAtt(wrtDoc, copy);
            return copy;
        }
        //return p.measure(bodyCode);
    }
    public validate(): boolean
    {
        //let bodyCode = () =>
        {
            return this.relationship && this.entity ? true : false;
        }
        //return p.measure(bodyCode);
    }

    public getFriendlyFormat(): friendlyFormatNode
    {
        //let bodyCode = () =>
        {
            let ff = new friendlyFormatNode();
            ff.separator = " ";
            ff.lineWrap = true;
            ff.addComment(this.explanation);
            ff.addChild(this.relationship.getFriendlyFormat());
            let ffSub = new friendlyFormatNode();
            ffSub.separator = ", ";
            ffSub.starter = "{";
            ffSub.terminator = "}";
            if (this.entity instanceof Array) {
                cdmObject.arrayGetFriendlyFormat(ffSub, this.entity);
                ffSub.forceWrap = true;
            }
            else {
                ffSub.addChild(this.entity.getFriendlyFormat());
                ffSub.forceWrap = false;
            }
            ff.addChild(ffSub);

            if (this.appliedTraits && this.appliedTraits.length) {
                let ffSub = new friendlyFormatNode();
                ffSub.separator = ", ";
                ffSub.starter = "[";
                ffSub.terminator = "]";
                ffSub.lineWrap = true;
                cdmObject.arrayGetFriendlyFormat(ff, this.appliedTraits);
                ff.addChild(ffSub);
            }
            return ff;
        }
        //return p.measure(bodyCode);
    }

    public static instanceFromData(object: any): EntityAttributeImpl
    {
        //let bodyCode = () =>
        {

            let c: EntityAttributeImpl = new EntityAttributeImpl(object.appliedTraits);

            if (object.explanation)
                c.explanation = object.explanation;

            if (object.entity instanceof Array) {
                c.entity = new Array<EntityReferenceImpl>();
                object.entity.forEach(e => {
                    (c.entity as Array<EntityReferenceImpl>).push(cdmObject.createEntityReference(e));
                });
            }
            else {
                c.entity = EntityReferenceImpl.instanceFromData(object.entity);
            }

            c.relationship = object.relationship ? cdmObject.createRelationshipReference(object.relationship) : undefined
            c.appliedTraits = cdmObject.createTraitReferenceArray(object.appliedTraits);
            return c;
        }
        //return p.measure(bodyCode);
    }
    public getName(): string
    {
        //let bodyCode = () =>
        {
            return "(unspecified)";
        }
        //return p.measure(bodyCode);
    }
    public getEntityRefIsArray(): boolean
    {
        //let bodyCode = () =>
        {
            return this.entity instanceof Array;
        }
        //return p.measure(bodyCode);
    }
    public getEntityRef(): (ICdmEntityRef | (ICdmEntityRef[]))
    {
        //let bodyCode = () =>
        {
            return this.entity;
        }
        //return p.measure(bodyCode);
    }
    public setEntityRef(entRef: (ICdmEntityRef | (ICdmEntityRef[]))): (ICdmEntityRef | (ICdmEntityRef[]))
    {
        //let bodyCode = () =>
        {
            this.entity = entRef as any;
            return this.entity;
        }
        //return p.measure(bodyCode);
    }
    public visit(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean
    {
        //let bodyCode = () =>
        {
            let path = this.declaredPath;
            if (!path) {
                path = pathFrom + "(unspecified)";
                this.declaredPath = path;
            }
            //trackVisits(path);

            if (preChildren && preChildren(this, path))
                return false;
            if (this.entity instanceof Array) {
                if (cdmObject.visitArray(this.entity, path + "/entity/", preChildren, postChildren))
                    return true;
            }
            else {
                if (this.entity)
                    if (this.entity.visit(path + "/entity/", preChildren, postChildren))
                        return true;
            }
            if (this.visitAtt(path, preChildren, postChildren))
                return true;
            if (postChildren && postChildren(this, path))
                return true;
            return false;
        }
        //return p.measure(bodyCode);
    }

    public constructResolvedTraits(rtsb: ResolvedTraitSetBuilder)
    {
        //let bodyCode = () =>
        {
            let set = rtsb.set;

            if (set == cdmTraitSet.inheritedOnly || set == cdmTraitSet.elevatedOnly) {
                if (set == cdmTraitSet.inheritedOnly)
                    set = cdmTraitSet.all;
                // // get from relationship
                if (this.relationship)
                    rtsb.takeReference(this.getRelationshipRef().getResolvedTraits(rtsb.wrtDoc, set));
            }

            if (set == cdmTraitSet.elevatedOnly) {
                // get from entities unless this is a ref
                let relRts = this.getRelationshipRef().getResolvedTraits(rtsb.wrtDoc, cdmTraitSet.all);
                if (!relRts || !relRts.find(rtsb.wrtDoc, "does.referenceEntity")) {
                    if (this.getEntityRefIsArray()) {
                        (this.entity as ICdmEntityRef[]).forEach(er =>
                        {
                            rtsb.mergeTraits(er.getResolvedTraits(rtsb.wrtDoc, cdmTraitSet.elevatedOnly));
                        });
                    }
                    else
                        rtsb.mergeTraits((this.entity as ICdmEntityRef).getResolvedTraits(rtsb.wrtDoc, cdmTraitSet.elevatedOnly));
                }
            }

            if (set == cdmTraitSet.appliedOnly || set == cdmTraitSet.elevatedOnly) {
                if (set == cdmTraitSet.appliedOnly)
                    set = cdmTraitSet.all;
                this.addResolvedTraitsApplied(rtsb);
            }
            rtsb.cleanUp();
        }
        //return p.measure(bodyCode);
    }

    public constructResolvedAttributes(wrtDoc: ICdmDocumentDef): ResolvedAttributeSetBuilder
    {
        //let bodyCode = () =>
        {
            // find and cache the complete set of attributes
            // attributes definitions originate from and then get modified by subsequent re-defintions from (in this order):
            // the entity used as an attribute, traits applied to that entity,
            // the relationship of the attribute, any traits applied to the attribute.
            let rasb = new ResolvedAttributeSetBuilder(wrtDoc);

            // complete cheating but is faster. this relationship will remove all of the attributes that get collected here, so dumb and slow to go get them
            let relRts = this.getRelationshipRef().getResolvedTraits(wrtDoc, cdmTraitSet.all);
            if (!relRts || !relRts.find(wrtDoc, "does.referenceEntity")) {
                if (this.getEntityRefIsArray()) {
                    (this.entity as ICdmEntityRef[]).forEach(er =>
                    {
                        rasb.mergeAttributes(er.getResolvedAttributes(wrtDoc));
                    });
                }
                else {
                    rasb.mergeAttributes((this.entity as ICdmEntityRef).getResolvedAttributes(wrtDoc));
                }
            }
            rasb.applyTraits(this.getResolvedTraits(wrtDoc, cdmTraitSet.all));

            // from the traits of relationship and applied here, see if new attributes get generated
            rasb.mergeTraitAttributes(this.getResolvedTraits(wrtDoc, cdmTraitSet.all));

            return rasb;
        }
        //return p.measure(bodyCode);
    }
    public getResolvedEntityReferences(wrtDoc : ICdmDocumentDef): ResolvedEntityReferenceSet
    {
        //let bodyCode = () =>
        {
            let relRts = this.getRelationshipRef().getResolvedTraits(wrtDoc, cdmTraitSet.all);
            if (relRts && relRts.find(wrtDoc, "does.referenceEntity")) {
                // only place this is used, so logic here instead of encapsulated. 
                // make a set and the one ref it will hold
                let rers = new ResolvedEntityReferenceSet(wrtDoc);
                let rer = new ResolvedEntityReference(wrtDoc);
                // referencing attribute(s) come from this attribute
                rer.referencing.rasb.mergeAttributes(this.getResolvedAttributes(wrtDoc));
                let resolveSide = (entRef: ICdmEntityRef): ResolvedEntityReferenceSide =>
                {
                    let sideOther = new ResolvedEntityReferenceSide(wrtDoc);
                    if (entRef) {
                        // reference to the other entity, hard part is the attribue name.
                        // by convention, this is held in a trait that identifies the key
                        sideOther.entity = entRef.getObjectDef(wrtDoc);
                        if (sideOther.entity) {
                            // now that we resolved the entity, it should be ok and much faster to switch to the
                            // context of the entities document to go after the key 
                            let wrtEntityDoc = sideOther.entity.declaredInDocument;
                            let otherAttribute: ICdmAttributeDef;
                            let t: ResolvedTrait = entRef.getResolvedTraits(wrtEntityDoc).find(wrtEntityDoc, "is.identifiedBy");
                            if (t && t.parameterValues && t.parameterValues.length) {
                                let otherRef = (t.parameterValues.getParameterValue("attribute").value);
                                if (otherRef && typeof(otherRef) === "object") {
                                    otherAttribute = (otherRef as ICdmObject).getObjectDef(wrtEntityDoc) as ICdmAttributeDef;
                                    if (otherAttribute) {
                                        if (!otherAttribute.getName)
                                            otherAttribute.getName();
                                        sideOther.rasb.ownOne(sideOther.entity.getResolvedAttributes(wrtEntityDoc).get(otherAttribute.getName()));
                                    }
                                }
                            }
                        }
                    }

                    return sideOther;
                };

                // either several or one entity
                if (this.getEntityRefIsArray()) {
                    (this.entity as ICdmEntityRef[]).forEach(er =>
                    {
                        rer.referenced.push(resolveSide(er));
                    });
                }
                else {
                    rer.referenced.push(resolveSide(this.entity as ICdmEntityRef));
                }
                rers.set.push(rer);
                return rers;
            }
            return null;
        }
        //return p.measure(bodyCode);
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  attribute groups
//
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
//  {AttributeGroupRef}
////////////////////////////////////////////////////////////////////////////////////////////////////
export class AttributeGroupReferenceImpl extends cdmObjectRef implements ICdmAttributeGroupRef
{
    constructor(attributeGroup: string | AttributeGroupImpl, simpleReference: boolean)
    {
        super(attributeGroup, simpleReference, false);
        //let bodyCode = () =>
        {
            this.objectType = cdmObjectType.attributeGroupRef;
        }
        //return p.measure(bodyCode);
    }
    public getObjectType(): cdmObjectType
    {
        //let bodyCode = () =>
        {
            return cdmObjectType.attributeGroupRef;
        }
        //return p.measure(bodyCode);
    }
    public copyRefData(wrtDoc: ICdmDocumentDef, copy : AttributeGroupReference, refTo : any, stringRefs: boolean) 
    {
        //let bodyCode = () =>
        {
            copy.attributeGroupReference = refTo;
        }
        //return p.measure(bodyCode);
    }
    public copyRefObject(wrtDoc: ICdmDocumentDef, refTo : string | AttributeGroupImpl, simpleReference: boolean): cdmObjectRef
    {
        //let bodyCode = () =>
        {
            let copy = new AttributeGroupReferenceImpl(refTo, this.simpleNamedReference);
            copy.ctx = this.ctx;
            return copy;
        }
        //return p.measure(bodyCode);
    }

    public static instanceFromData(object: any): AttributeGroupReferenceImpl
    {
        //let bodyCode = () =>
        {
            let simpleReference : boolean = true;
            let attributeGroup : string | AttributeGroupImpl;
            if (typeof(object) == "string")
                attributeGroup = object;
            else {
                simpleReference = false;
                if (typeof(object.attributeGroupReference) === "string")
                    attributeGroup = object.attributeGroupReference;
                else 
                    attributeGroup = AttributeGroupImpl.instanceFromData(object.attributeGroupReference);
            }

            let c: AttributeGroupReferenceImpl = new AttributeGroupReferenceImpl(attributeGroup, simpleReference);
            return c;
        }
        //return p.measure(bodyCode);
    }
    public getAppliedTraitRefs(): ICdmTraitRef[]
    {
        //let bodyCode = () =>
        {
            return null;
        }
        //return p.measure(bodyCode);
    }
    public visitRef(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean
    {
        //let bodyCode = () =>
        {
            return false;
        }
        //return p.measure(bodyCode);
    }
    public getResolvedEntityReferences(wrtDoc : ICdmDocumentDef): ResolvedEntityReferenceSet
    {
        //let bodyCode = () =>
        {
            let ref = this.getResolvedReference(wrtDoc);
            if (ref)
                return (ref as AttributeGroupImpl).getResolvedEntityReferences(wrtDoc);
            if (this.explicitReference)
                return (this.explicitReference as AttributeGroupImpl).getResolvedEntityReferences(wrtDoc);
            return null;
        }
        //return p.measure(bodyCode);
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////
//  {AttributeGroupDef}
////////////////////////////////////////////////////////////////////////////////////////////////////
export class AttributeGroupImpl extends cdmObjectDef implements ICdmAttributeGroupDef
{
    attributeGroupName: string;
    members: (AttributeGroupReferenceImpl | TypeAttributeImpl | EntityAttributeImpl)[];

    constructor(attributeGroupName: string)
    {
        super();
        //let bodyCode = () =>
        {
            this.objectType = cdmObjectType.attributeGroupDef;
            this.attributeGroupName = attributeGroupName;
            this.members = new Array<AttributeGroupReferenceImpl | TypeAttributeImpl | EntityAttributeImpl>();
        }
        //return p.measure(bodyCode);
    }
    public getObjectType(): cdmObjectType
    {
        //let bodyCode = () =>
        {
            return cdmObjectType.attributeGroupDef;
        }
        //return p.measure(bodyCode);
    }
    public isDerivedFrom(wrtDoc : ICdmDocumentDef, base: string): boolean
    {
        //let bodyCode = () =>
        {
            return false;
        }
        //return p.measure(bodyCode);
    }
    public copyData(wrtDoc:ICdmDocumentDef, stringRefs?: boolean): AttributeGroup
    {
        //let bodyCode = () =>
        {
            let castedToInterface: AttributeGroup = {
                explanation: this.explanation,
                attributeGroupName: this.attributeGroupName,
                exhibitsTraits: cdmObject.arraycopyData<string | TraitReference>(wrtDoc, this.exhibitsTraits, stringRefs),
                members: cdmObject.arraycopyData<string | AttributeGroupReference | TypeAttribute | EntityAttribute>(wrtDoc, this.members, stringRefs)
            };
            return castedToInterface;
        }
        //return p.measure(bodyCode);
    }
    public copy(wrtDoc: ICdmDocumentDef): ICdmObject
    {
        //let bodyCode = () =>
        {
            let copy = new AttributeGroupImpl(this.attributeGroupName);
            copy.ctx = this.ctx;
            copy.members = cdmObject.arrayCopy<AttributeGroupReferenceImpl | TypeAttributeImpl | EntityAttributeImpl>(wrtDoc, this.members);
            this.copyDef(wrtDoc, copy);
            return copy;
        }
        //return p.measure(bodyCode);
    }
    public validate(): boolean
    {
        //let bodyCode = () =>
        {
            return this.attributeGroupName ? true : false;
        }
        //return p.measure(bodyCode);
    }
    public getFriendlyFormat(): friendlyFormatNode
    {
        //let bodyCode = () =>
        {
            let ff = new friendlyFormatNode();
            ff.separator = " ";
            ff.addChildString("attributeGroup");
            ff.addChildString(this.attributeGroupName);
            this.getFriendlyFormatDef(ff);
            let ffSub = new friendlyFormatNode();
            //ffSub.forceWrap = true;
            ffSub.verticalMode = true;
            ffSub.bracketEmpty = true;
            ffSub.indentChildren = true;
            ffSub.separator = ";\n";
            ffSub.starter = "{";
            ffSub.terminator = "}";
            cdmObject.arrayGetFriendlyFormat(ffSub, this.members);
            ff.addChild(ffSub);
            return ff;
        }
        //return p.measure(bodyCode);
    }
    public static instanceFromData(object: any): AttributeGroupImpl
    {
        //let bodyCode = () =>
        {
            let c: AttributeGroupImpl = new AttributeGroupImpl(object.attributeGroupName);

            if (object.explanation)
                c.explanation = object.explanation;

            c.members = cdmObject.createAttributeArray(object.members);
            c.exhibitsTraits = cdmObject.createTraitReferenceArray(object.exhibitsTraits);

            return c;
        }
        //return p.measure(bodyCode);
    }
    public getName(): string
    {
        //let bodyCode = () =>
        {
            return this.attributeGroupName;
        }
        //return p.measure(bodyCode);
    }
    public getMembersAttributeDefs(): (ICdmAttributeGroupRef | ICdmTypeAttributeDef | ICdmEntityAttributeDef)[]
    {
        //let bodyCode = () =>
        {
            return this.members;
        }
        //return p.measure(bodyCode);
    }
    public addMemberAttributeDef(attDef: ICdmAttributeGroupRef | ICdmTypeAttributeDef | ICdmEntityAttributeDef): ICdmAttributeGroupRef | ICdmTypeAttributeDef | ICdmEntityAttributeDef
    {
        //let bodyCode = () =>
        {
            if (!this.members)
                this.members = new Array<(AttributeGroupReferenceImpl | TypeAttributeImpl | EntityAttributeImpl)>();
            this.members.push(attDef as any);
            return attDef;
        }
        //return p.measure(bodyCode);
    }
    public visit(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean
    {
        //let bodyCode = () =>
        {
            let path = this.declaredPath;
            if (!path) {
                path = pathFrom + this.attributeGroupName;
                this.declaredPath = path;
            }
            //trackVisits(path);

            if (preChildren && preChildren(this, path))
                return false;
            if (this.members)
                if (cdmObject.visitArray(this.members, path + "/members/", preChildren, postChildren))
                    return true;
            if (this.visitDef(path, preChildren, postChildren))
                return true;

            if (postChildren && postChildren(this, path))
                return true;
            return false;
        }
        //return p.measure(bodyCode);
    }
    public constructResolvedAttributes(wrtDoc: ICdmDocumentDef): ResolvedAttributeSetBuilder
    {
        //let bodyCode = () =>
        {
            let rasb = new ResolvedAttributeSetBuilder(wrtDoc);

            if (this.members) {
                let l = this.members.length;
                for (let i = 0; i < l; i++) {
                    rasb.mergeAttributes(this.members[i].getResolvedAttributes(wrtDoc));
                }
            }

            // things that need to go away
            rasb.removeRequestedAtts();
            return rasb;
        }
        //return p.measure(bodyCode);
    }
    public getResolvedEntityReferences(wrtDoc : ICdmDocumentDef): ResolvedEntityReferenceSet
    {
        //let bodyCode = () =>
        {
            let rers = new ResolvedEntityReferenceSet(wrtDoc);
            if (this.members) {
                let l = this.members.length;
                for (let i = 0; i < l; i++) {
                    rers.add(this.members[i].getResolvedEntityReferences(wrtDoc));
                }
            }
            return rers;
        }
        //return p.measure(bodyCode);
    }

    public constructResolvedTraits(rtsb: ResolvedTraitSetBuilder)
    {
        //let bodyCode = () =>
        {
            let set = rtsb.set;

            if (set != cdmTraitSet.appliedOnly) {
                if (set == cdmTraitSet.inheritedOnly)
                    set = cdmTraitSet.all;
                this.constructResolvedTraitsDef(undefined, rtsb);
                if (set == cdmTraitSet.elevatedOnly) {
                    if (this.members) {
                        // run it twice, pull out the entityattributes first
                        // this way any elevated traits from direct attributes get applied last
                        let l = this.members.length;
                        for (let i = 0; i < l; i++) {
                            let att = this.members[i];
                            let attOt = att.objectType;
                            if (attOt == cdmObjectType.entityAttributeDef)
                                rtsb.mergeTraits(att.getResolvedTraits(rtsb.wrtDoc, cdmTraitSet.elevatedOnly), att as ICdmAttributeDef);
                        }
                        for (let i = 0; i < l; i++) {
                            let att = this.members[i];
                            let attOt = att.objectType;
                            if (attOt != cdmObjectType.entityAttributeDef)
                                rtsb.mergeTraits(att.getResolvedTraits(rtsb.wrtDoc, cdmTraitSet.elevatedOnly), (attOt == cdmObjectType.typeAttributeDef) ? att as ICdmAttributeDef : null);
                        }
                    }
                }

            }
            rtsb.cleanUp();
        }
        //return p.measure(bodyCode);
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  the 'constant' entity
//
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
export class ConstantEntityImpl extends cdmObjectDef implements ICdmConstantEntityDef
{
    constantEntityName: string;
    entityShape: EntityReferenceImpl;
    constantValues: string[][];

    constructor()
    {
        super();
        //let bodyCode = () =>
        {
            this.objectType = cdmObjectType.constantEntityDef;
        }
        //return p.measure(bodyCode);
    }

    public copyData(wrtDoc:ICdmDocumentDef, stringRefs?: boolean): ConstantEntity
    {
        //let bodyCode = () =>
        {
            let castedToInterface: ConstantEntity = {
                explanation: this.explanation,
                constantEntityName: this.constantEntityName,
                entityShape: this.entityShape ? this.entityShape.copyData(wrtDoc, stringRefs) : undefined,
                constantValues: this.constantValues
            };
            return castedToInterface;
        }
        //return p.measure(bodyCode);
    }
    public copy(wrtDoc: ICdmDocumentDef): ICdmObject
    {
        //let bodyCode = () =>
        {
            let copy = new ConstantEntityImpl();
            copy.ctx = this.ctx;
            copy.constantEntityName = this.constantEntityName;
            copy.entityShape = <EntityReferenceImpl>this.entityShape.copy(wrtDoc);
            copy.constantValues = this.constantValues; // is a deep copy needed? 
            this.copyDef(wrtDoc, copy);
            return copy;
        }
        //return p.measure(bodyCode);
    }
    public validate(): boolean
    {
        //let bodyCode = () =>
        {
            return this.entityShape ? true : false;
        }
        //return p.measure(bodyCode);
    }
    public getFriendlyFormat(): friendlyFormatNode
    {
        //let bodyCode = () =>
        {
            let ff = new friendlyFormatNode();
            ff.separator = " ";
            ff.lineWrap = true;
            let ffDecl = new friendlyFormatNode();
            ff.addChild(ffDecl);
            ffDecl.separator = " ";
            ffDecl.addChildString("constant entity");
            ffDecl.addChildString(this.constantEntityName);
            ffDecl.addChildString("shaped like");
            ffDecl.addChild(this.entityShape.getFriendlyFormat());
            ffDecl.addChildString("contains");

            let ffTable = new friendlyFormatNode();
            ff.addChild(ffTable);
            ffTable.forceWrap = this.constantValues.length > 1;
            ffTable.bracketEmpty = true;
            ffTable.starter = "{";
            ffTable.terminator = "}";
            ffTable.separator = ",";
            for (let iRow = 0; iRow < this.constantValues.length; iRow++) {
                let ffRow = new friendlyFormatNode();
                ffRow.bracketEmpty = false;
                ffRow.starter = "{";
                ffRow.terminator = "}";
                ffRow.separator = ", ";
                const rowArray = this.constantValues[iRow];
                for (let iCol = 0; iCol < rowArray.length; iCol++) {
                    ffRow.addChildString(rowArray[iCol], true);
                }
                ffTable.addChild(ffRow);
            }
            return ff;
        }
        //return p.measure(bodyCode);
    }
    public getObjectType(): cdmObjectType
    {
        //let bodyCode = () =>
        {
            return cdmObjectType.constantEntityDef;
        }
        //return p.measure(bodyCode);
    }
    public isDerivedFrom(wrtDoc : ICdmDocumentDef, base: string): boolean
    {
        //let bodyCode = () =>
        {
            return false;
        }
        //return p.measure(bodyCode);
    }
    public static instanceFromData(object: any): ConstantEntityImpl
    {

        //let bodyCode = () =>
        {
            let c: ConstantEntityImpl = new ConstantEntityImpl();
            if (object.explanation)
                c.explanation = object.explanation;
            if (object.constantEntityName)
                c.constantEntityName = object.constantEntityName;
            c.constantValues = object.constantValues;
            c.entityShape = cdmObject.createEntityReference(object.entityShape);
            return c;
        }
        //return p.measure(bodyCode);
    }
    public getName(): string
    {
        //let bodyCode = () =>
        {
            return this.constantEntityName;
        }
        //return p.measure(bodyCode);
    }
    public getEntityShape(): ICdmEntityRef
    {
        //let bodyCode = () =>
        {
            return this.entityShape;
        }
        //return p.measure(bodyCode);
    }
    public setEntityShape(shape: ICdmEntityRef): ICdmEntityRef
    {
        //let bodyCode = () =>
        {
            this.entityShape = <any>shape;
            return this.entityShape;
        }
        //return p.measure(bodyCode);
    }

    public getConstantValues(): string[][]
    {
        //let bodyCode = () =>
        {
            return this.constantValues;
        }
        //return p.measure(bodyCode);
    }
    public setConstantValues(values: string[][]): string[][]
    {
        //let bodyCode = () =>
        {
            this.constantValues = values;
            return this.constantValues;
        }
        //return p.measure(bodyCode);
    }
    public visit(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean
    {
        //let bodyCode = () =>
        {
            let path = this.declaredPath;
            if (!path) {
                path = pathFrom + (this.constantEntityName ? this.constantEntityName : "(unspecified)");
                this.declaredPath = path;
            }
            //trackVisits(path);

            if (preChildren && preChildren(this, path))
                return false;
            if (this.entityShape)
                if (this.entityShape.visit(path + "/entityShape/", preChildren, postChildren))
                    return true;
            if (postChildren && postChildren(this, path))
                return true;
            return false;
        }
        //return p.measure(bodyCode);
    }
    public constructResolvedTraits(rtsb: ResolvedTraitSetBuilder)
    {
        //let bodyCode = () =>
        {
            return null;
        }
        //return p.measure(bodyCode);
    }

    public constructResolvedAttributes(wrtDoc: ICdmDocumentDef): ResolvedAttributeSetBuilder
    {
        //let bodyCode = () =>
        {
            let rasb = new ResolvedAttributeSetBuilder(wrtDoc);
            if (this.entityShape)
                rasb.mergeAttributes(this.getEntityShape().getResolvedAttributes(wrtDoc));

            // things that need to go away
            rasb.removeRequestedAtts();
            return rasb;
        }
        //return p.measure(bodyCode);
    }

    // the world's smallest complete query processor...
    findValue(wrtDoc:ICdmDocumentDef, attReturn: string | number, attSearch: string | number, valueSearch: string, action: (found : string)=>string)
    {
        //let bodyCode = () =>
        {
            let resultAtt = -1;
            let searchAtt = -1;

            if (typeof(attReturn) === "number")
                resultAtt = attReturn;
            if (typeof(attSearch) === "number")
                searchAtt = attSearch;

            if (resultAtt == -1 || searchAtt == -1) {
                // metadata library
                let ras = this.getResolvedAttributes(wrtDoc);
                // query validation and binding
                let l = ras.set.length;
                for (let i = 0; i < l; i++) {
                    let name = ras.set[i].resolvedName;
                    if (resultAtt == -1 && name === attReturn)
                        resultAtt = i;
                    if (searchAtt == -1 && name === attSearch)
                        searchAtt = i;
                    if (resultAtt >= 0 && searchAtt >= 0)
                        break;
                }
            }

            // rowset processing
            if (resultAtt >= 0 && searchAtt >= 0) {
                if (this.constantValues && this.constantValues.length) {
                    for (let i = 0; i < this.constantValues.length; i++) {
                        if (this.constantValues[i][searchAtt] == valueSearch) {
                            this.constantValues[i][resultAtt] = action(this.constantValues[i][resultAtt]);
                            return;
                        }
                    }
                }
            }
            return;
        }
        //return p.measure(bodyCode);
    }

    public lookupWhere(wrtDoc:ICdmDocumentDef, attReturn: string | number, attSearch: string | number, valueSearch: string): string
    {
        //let bodyCode = () =>
        {
            let result : string;
            this.findValue(wrtDoc, attReturn, attSearch, valueSearch, found=>{ result = found; return found;})
            return result;
        }
        //return p.measure(bodyCode);
    }
    public setWhere(wrtDoc:ICdmDocumentDef, attReturn: string | number, newValue: string, attSearch: string | number, valueSearch: string) : string {
        //let bodyCode = () =>
        {
            let result : string;
            this.findValue(wrtDoc, attReturn, attSearch, valueSearch, found=>{ result = found; return newValue; })
            return result;
        }
        //return p.measure(bodyCode);
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  Entities
//
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
//  {EntityRef}
////////////////////////////////////////////////////////////////////////////////////////////////////
export class EntityReferenceImpl extends cdmObjectRef implements ICdmObjectRef
{
    constructor(entityRef: string | EntityImpl | ConstantEntityImpl, simpleReference : boolean, appliedTraits: boolean)
    {
        super(entityRef, simpleReference, appliedTraits);
        //let bodyCode = () =>
        {
            this.objectType = cdmObjectType.entityRef;
        }
        //return p.measure(bodyCode);
    }
    public getObjectType(): cdmObjectType
    {
        //let bodyCode = () =>
        {
            return cdmObjectType.entityRef;
        }
        //return p.measure(bodyCode);
    }
    public copyRefData(wrtDoc: ICdmDocumentDef, copy : EntityReference, refTo : any, stringRefs?: boolean) 
    {
        //let bodyCode = () =>
        {
            copy.entityReference = refTo;
        }
        //return p.measure(bodyCode);
    }
    public copyRefObject(wrtDoc: ICdmDocumentDef, refTo : string | EntityImpl | ConstantEntityImpl, simpleReference: boolean): cdmObjectRef
    {
        //let bodyCode = () =>
        {
            let copy = new EntityReferenceImpl(refTo, simpleReference, (this.appliedTraits && this.appliedTraits.length > 0));
            copy.ctx = this.ctx;
            return copy;
        }
        //return p.measure(bodyCode);
    }
    public static instanceFromData(object: any): EntityReferenceImpl
    {

        //let bodyCode = () =>
        {
            let simpleReference : boolean = true;
            let entity : string | EntityImpl | ConstantEntityImpl;
            if (typeof(object) == "string")
                entity = object;
            else {
                simpleReference = false;
                if (typeof(object.entityReference) === "string")
                    entity = object.entityReference;
                else if (object.entityReference.entityShape)
                    entity = ConstantEntityImpl.instanceFromData(object.entityReference);
                else
                    entity = EntityImpl.instanceFromData(object.entityReference);
                }

            let c: EntityReferenceImpl = new EntityReferenceImpl(entity, simpleReference, object.appliedTraits);
            c.appliedTraits = cdmObject.createTraitReferenceArray(object.appliedTraits);
            return c;
        }
        //return p.measure(bodyCode);
    }
    public visitRef(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean
    {
        //let bodyCode = () =>
        {
            return false;
        }
        //return p.measure(bodyCode);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//  {EntityDef}
////////////////////////////////////////////////////////////////////////////////////////////////////
export class EntityImpl extends cdmObjectDef implements ICdmEntityDef
{
    entityName: string;
    extendsEntity?: EntityReferenceImpl;
    hasAttributes?: (AttributeGroupReferenceImpl | TypeAttributeImpl | EntityAttributeImpl)[];
    rasb: ResolvedAttributeSetBuilder;
    t2pm: traitToPropertyMap;
    docDeclared: Document;
    ctxDefault: resolveContext;
    constructor(entityName: string, extendsEntity: EntityReferenceImpl, exhibitsTraits: boolean = false, hasAttributes: boolean = false)
    {
        super(exhibitsTraits);
        //let bodyCode = () =>
        {
            this.objectType = cdmObjectType.entityDef;
            this.entityName = entityName;
            if (extendsEntity)
                this.extendsEntity = extendsEntity;
            if (hasAttributes)
                this.hasAttributes = new Array<(AttributeGroupReferenceImpl | TypeAttributeImpl | EntityAttributeImpl)>();
        }
        //return p.measure(bodyCode);
    }
    public getObjectType(): cdmObjectType
    {
        //let bodyCode = () =>
        {
            return cdmObjectType.entityDef;
        }
        //return p.measure(bodyCode);
    }
    public copyData(wrtDoc:ICdmDocumentDef, stringRefs?: boolean): Entity
    {
        //let bodyCode = () =>
        {
            let castedToInterface: Entity = {
                explanation: this.explanation,
                entityName: this.entityName,
                extendsEntity: this.extendsEntity ? this.extendsEntity.copyData(wrtDoc, stringRefs) : undefined,
                exhibitsTraits: cdmObject.arraycopyData<string | TraitReference>(wrtDoc, this.exhibitsTraits, stringRefs),
            };
            this.getTraitToPropertyMap().persistForEntityDef(castedToInterface);
            // after the properties so they show up first in doc
            castedToInterface.hasAttributes = cdmObject.arraycopyData<string | AttributeGroupReference | TypeAttribute | EntityAttribute>(wrtDoc, this.hasAttributes, stringRefs);

            return castedToInterface;
        }
        //return p.measure(bodyCode);
    }
    public copy(wrtDoc: ICdmDocumentDef): ICdmObject
    {
        //let bodyCode = () =>
        {
            let copy = new EntityImpl(this.entityName, null, false, false);
            copy.ctx = this.ctx;
            copy.extendsEntity = copy.extendsEntity ? <EntityReferenceImpl>this.extendsEntity.copy(wrtDoc) : undefined;
            copy.hasAttributes = cdmObject.arrayCopy<AttributeGroupReferenceImpl | TypeAttributeImpl | EntityAttributeImpl>(wrtDoc, this.hasAttributes);
            this.copyDef(wrtDoc, copy);
            return copy;
        }
        //return p.measure(bodyCode);
    }
    public validate(): boolean
    {
        //let bodyCode = () =>
        {
            return this.entityName ? true : false;
        }
        //return p.measure(bodyCode);
    }
    public getFriendlyFormat(): friendlyFormatNode
    {
        //let bodyCode = () =>
        {
            let ff = new friendlyFormatNode();
            ff.separator = " ";
            ff.separator = " ";
            ff.addChildString("entity");
            ff.addChildString(this.entityName);
            if (this.extendsEntity) {
                ff.addChildString("extends");
                ff.addChild(this.extendsEntity.getFriendlyFormat());
            }
            this.getFriendlyFormatDef(ff);
            let ffSub = new friendlyFormatNode();
            //ffSub.forceWrap = true;
            ffSub.verticalMode = true;
            ffSub.bracketEmpty = true;
            ffSub.indentChildren = true;
            ffSub.separator = ";\n";
            ffSub.starter = "{";
            ffSub.terminator = "}";
            cdmObject.arrayGetFriendlyFormat(ffSub, this.hasAttributes);
            ff.addChild(ffSub);
            return ff;
        }
        //return p.measure(bodyCode);
    }
    public static instanceFromData(object: any): EntityImpl
    {
        //let bodyCode = () =>
        {

            let extendsEntity: EntityReferenceImpl;
            extendsEntity = cdmObject.createEntityReference(object.extendsEntity);
            let c: EntityImpl = new EntityImpl(object.entityName, extendsEntity, object.exhibitsTraits, object.hasAttributes);

            if (object.explanation)
                c.explanation = object.explanation;

            c.exhibitsTraits = cdmObject.createTraitReferenceArray(object.exhibitsTraits);
            c.hasAttributes = cdmObject.createAttributeArray(object.hasAttributes);
            c.t2pm = new traitToPropertyMap();
            c.t2pm.initForEntityDef(object as Entity, c);

            return c;
        }
        //return p.measure(bodyCode);
    }
    public get declaredInDocument() : ICdmDocumentDef {
        return this.docDeclared as ICdmDocumentDef;
    }
    public getName(): string
    {
        //let bodyCode = () =>
        {
            return this.entityName;
        }
        //return p.measure(bodyCode);
    }
    public getExtendsEntityRef(): ICdmObjectRef
    {
        //let bodyCode = () =>
        {
            return this.extendsEntity;
        }
        //return p.measure(bodyCode);
    }
    public setExtendsEntityRef(ref: ICdmObjectRef): ICdmObjectRef
    {
        //let bodyCode = () =>
        {
            this.extendsEntity = ref as EntityReferenceImpl;
            return this.extendsEntity;
        }
        //return p.measure(bodyCode);
    }
    public getHasAttributeDefs(): (ICdmAttributeGroupRef | ICdmTypeAttributeDef | ICdmEntityAttributeDef)[]
    {
        //let bodyCode = () =>
        {
            return this.hasAttributes;
        }
        //return p.measure(bodyCode);
    }
    public addAttributeDef(attDef: ICdmAttributeGroupRef | ICdmTypeAttributeDef | ICdmEntityAttributeDef): ICdmAttributeGroupRef | ICdmTypeAttributeDef | ICdmEntityAttributeDef
    {
        //let bodyCode = () =>
        {
            if (!this.hasAttributes)
                this.hasAttributes = new Array<(AttributeGroupReferenceImpl | TypeAttributeImpl | EntityAttributeImpl)>();
            this.hasAttributes.push(attDef as any);
            return attDef;
        }
        //return p.measure(bodyCode);
    }
    getTraitToPropertyMap()
    {
        if (this.t2pm)
            return this.t2pm;
        this.t2pm = new traitToPropertyMap();
        this.t2pm.initForEntityDef(null, this);
        return this.t2pm;
    }

    public get sourceName() : string
    {
        return this.getTraitToPropertyMap().getPropertyValue("sourceName");
    }
    public set sourceName(val: string)
    {
        this.getTraitToPropertyMap().setPropertyValue("sourceName", val);
    }
    public get description() : string
    {
        return this.getTraitToPropertyMap().getPropertyValue("description");
    }
    public set description(val: string)
    {
        this.getTraitToPropertyMap().setPropertyValue("description", val);
    }
    public get displayName() : string
    {
        return this.getTraitToPropertyMap().getPropertyValue("displayName");
    }
    public set displayName(val: string)
    {
        this.getTraitToPropertyMap().setPropertyValue("displayName", val);
    }
    public get version() : string
    {
        return this.getTraitToPropertyMap().getPropertyValue("version");
    }
    public set version(val: string)
    {
        this.getTraitToPropertyMap().setPropertyValue("version", val);
    }
    public get cdmSchemas() : string[]
    {
        return this.getTraitToPropertyMap().getPropertyValue("cdmSchemas");
    }
    public set cdmSchemas(val: string[])
    {
        this.getTraitToPropertyMap().setPropertyValue("cdmSchemas", val);
    }
    public get primaryKey() : string
    {
        return this.getTraitToPropertyMap().getPropertyValue("primaryKey");
    }

    public visit(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean
    {
        //let bodyCode = () =>
        {
            let path = this.declaredPath;
            if (!path) {
                path = pathFrom + this.entityName;
                this.declaredPath = path;
            }
            //trackVisits(path);

            if (preChildren && preChildren(this, path))
                return false;
            if (this.extendsEntity)
                if (this.extendsEntity.visit(path + "/extendsEntity/", preChildren, postChildren))
                    return true;
            if (this.visitDef(path, preChildren, postChildren))
                return true;
            if (this.hasAttributes)
                if (cdmObject.visitArray(this.hasAttributes, path + "/hasAttributes/", preChildren, postChildren))
                    return true;
            if (postChildren && postChildren(this, path))
                return true;
            return false;
        }
        //return p.measure(bodyCode);
    }
    public isDerivedFrom(wrtDoc : ICdmDocumentDef, base: string): boolean
    {
        //let bodyCode = () =>
        {
            return this.isDerivedFromDef(wrtDoc, this.getExtendsEntityRef(), this.getName(), base);
        }
        //return p.measure(bodyCode);
    }

    public constructResolvedTraits(rtsb: ResolvedTraitSetBuilder)
    {
        //let bodyCode = () =>
        {
            let set = rtsb.set;

            if (set != cdmTraitSet.appliedOnly) {
                if (set == cdmTraitSet.inheritedOnly)
                    set = cdmTraitSet.all;
                this.constructResolvedTraitsDef(this.getExtendsEntityRef(), rtsb);

                if (set == cdmTraitSet.elevatedOnly) {
                    if (this.hasAttributes) {
                        // run it twice, pull out the entityattributes first
                        let l = this.hasAttributes.length;
                        for (let i = 0; i < l; i++) {
                            let att = this.hasAttributes[i];
                            let attOt = att.objectType;
                            if (attOt == cdmObjectType.entityAttributeDef)
                                rtsb.mergeTraits(att.getResolvedTraits(rtsb.wrtDoc, cdmTraitSet.elevatedOnly), att as ICdmAttributeDef);
                        }
                        for (let i = 0; i < l; i++) {
                            let att = this.hasAttributes[i];
                            let attOt = att.objectType;
                            if (attOt != cdmObjectType.entityAttributeDef)
                                rtsb.mergeTraits(att.getResolvedTraits(rtsb.wrtDoc, cdmTraitSet.elevatedOnly), (attOt == cdmObjectType.typeAttributeDef) ? att as ICdmAttributeDef : null);
                        }
                    }
                }

            }
            rtsb.cleanUp();
        }
        //return p.measure(bodyCode);
    }

    public constructResolvedAttributes(wrtDoc: ICdmDocumentDef): ResolvedAttributeSetBuilder
    {
        //let bodyCode = () =>
        {
            // find and cache the complete set of attributes
            // attributes definitions originate from and then get modified by subsequent re-defintions from (in this order):
            // an extended entity, traits applied to extended entity, exhibited traits of main entity, the (datatype or entity) used as an attribute, traits applied to that datatype or entity,
            // the relationsip of the attribute, the attribute definition itself and included attribute groups, any traits applied to the attribute.
            this.rasb = new ResolvedAttributeSetBuilder(wrtDoc);
            if (this.extendsEntity)
                this.rasb.mergeAttributes(this.getExtendsEntityRef().getResolvedAttributes(wrtDoc));
            this.rasb.markInherited();

            if (this.hasAttributes) {
                let l = this.hasAttributes.length;
                for (let i = 0; i < l; i++) {
                    this.rasb.mergeAttributes(this.hasAttributes[i].getResolvedAttributes(wrtDoc));
                }
            }

            // things that need to go away
            this.rasb.removeRequestedAtts();

            return this.rasb;
        }
        //return p.measure(bodyCode);
    }

    public countInheritedAttributes(wrtDoc: ICdmDocumentDef): number
    {
        //let bodyCode = () =>
        {
            // ensures that cache exits
            this.getResolvedAttributes(wrtDoc);
            return this.rasb.inheritedMark;
        }
        //return p.measure(bodyCode);
    }

    public getResolvedEntity(wrtDoc : ICdmDocumentDef) : ResolvedEntity {
        return new ResolvedEntity(wrtDoc, this);
    }

    public getResolvedEntityReferences(wrtDoc : ICdmDocumentDef): ResolvedEntityReferenceSet
    {
        //let bodyCode = () =>
        {
            let entRefSetCache = this.ctx.getCache(this, wrtDoc, "entRefSet") as ResolvedEntityReferenceSet;
            if (!entRefSetCache) {
                entRefSetCache = new ResolvedEntityReferenceSet(wrtDoc);
                // get from any base class and then 'fix' those to point here instead.
                let extRef = this.getExtendsEntityRef();
                if (extRef) {
                    let extDef = extRef.getObjectDef<ICdmEntityDef>(wrtDoc);
                    if (extDef) {
                        if (extDef === this)
                            extDef = extRef.getObjectDef<ICdmEntityDef>(wrtDoc);
                        let inherited = extDef.getResolvedEntityReferences(wrtDoc);
                        if (inherited) {
                            inherited.set.forEach((res) =>
                            {
                                res = res.copy();
                                res.referencing.entity = this;
                                entRefSetCache.set.push(res);
                            });
                        }
                    }
                }
                if (this.hasAttributes) {
                    let l = this.hasAttributes.length;
                    for (let i = 0; i < l; i++) {
                        // if any refs come back from attributes, they don't know who we are, so they don't set the entity
                        let sub = this.hasAttributes[i].getResolvedEntityReferences(wrtDoc);
                        if (sub) {
                            sub.set.forEach((res) =>
                            {
                                res.referencing.entity = this;
                            });

                            entRefSetCache.add(sub);
                        }
                    }
                }
                this.ctx.setCache(this, wrtDoc, "entRefSet", entRefSetCache);
            }
            return entRefSetCache;
        }
        //return p.measure(bodyCode);
    }

    getAttributesWithTraits(wrtDoc:ICdmDocumentDef, queryFor: TraitSpec | TraitSpec[]): ResolvedAttributeSet
    {
        //let bodyCode = () =>
        {
            return this.getResolvedAttributes(wrtDoc).getAttributesWithTraits(queryFor);
        }
        //return p.measure(bodyCode);
    }

}


////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  documents and folders
//
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////
//  {DocumentDef}
////////////////////////////////////////////////////////////////////////////////////////////////////
export class Document extends cdmObjectSimple implements ICdmDocumentDef  
{
    name: string;
    path: string;
    schema: string;
    schemaVersion: string;
    imports: ImportImpl[];
    definitions: (TraitImpl | DataTypeImpl | RelationshipImpl | AttributeGroupImpl | EntityImpl | ConstantEntityImpl)[];
    importSetKey: string;
    folder: Folder;
    internalDeclarations: Map<string, cdmObjectDef>;
    extenalDeclarationCache: Map<string, [cdmObjectDef, boolean]>
    monikeredImports: Map<string, Document>;
    flatImports: Array<Document>;


    constructor(name: string, hasImports: boolean = false)
    {
        super();
        //let bodyCode = () =>
        {
            this.objectType = cdmObjectType.documentDef;
            this.name = name;
            this.schemaVersion = "0.6.0";

            this.definitions = new Array<TraitImpl | DataTypeImpl | RelationshipImpl | AttributeGroupImpl | EntityImpl | ConstantEntityImpl>();
            this.internalDeclarations = new Map<string, cdmObjectDef>();
            if (hasImports)
                this.imports = new Array<ImportImpl>();
            this.monikeredImports = new Map<string, Document>();
            this.flatImports = new Array<Document>();
    
        }
        //return p.measure(bodyCode);
    }
    public getObjectType(): cdmObjectType
    {
        //let bodyCode = () =>
        {
            return cdmObjectType.documentDef;
        }
        //return p.measure(bodyCode);
    }
    public getObjectDef<T=ICdmObjectDef>(): T
    {
        return null;
    }
    public copyData(wrtDoc:ICdmDocumentDef, stringRefs?: boolean): DocumentContent
    {
        //let bodyCode = () =>
        {
            let castedToInterface: DocumentContent = {
                schema: this.schema,
                schemaVersion: this.schemaVersion,
                imports: cdmObject.arraycopyData<Import>(wrtDoc, this.imports, stringRefs),
                definitions: cdmObject.arraycopyData<Trait | DataType | Relationship | AttributeGroup | Entity | ConstantEntity>(wrtDoc, this.definitions, stringRefs)
            };
            return castedToInterface;
        }
        //return p.measure(bodyCode);
    }
    public copy(wrtDoc: ICdmDocumentDef): ICdmObject
    {
        //let bodyCode = () =>
        {
            let c = new Document(this.name, (this.imports && this.imports.length > 0));
            c.ctx = this.ctx;
            c.path = this.path;
            c.schema = this.schema;
            c.schemaVersion = this.schemaVersion;
            c.definitions = cdmObject.arrayCopy<TraitImpl | DataTypeImpl | RelationshipImpl | AttributeGroupImpl | EntityImpl | ConstantEntityImpl>(wrtDoc, this.definitions);
            c.imports = cdmObject.arrayCopy<ImportImpl>(wrtDoc, this.imports);
            return c;
        }
        //return p.measure(bodyCode);
    }
    public validate(): boolean
    {
        //let bodyCode = () =>
        {
            return this.name ? true : false;
        }
        //return p.measure(bodyCode);
    }
    public getFriendlyFormat(): friendlyFormatNode
    {
        //let bodyCode = () =>
        {
            let ff = new friendlyFormatNode();
            ff.verticalMode = true;
            ff.indentChildren = false;
            ff.separator = "\n";

            let ffImp = new friendlyFormatNode();
            ffImp.indentChildren = false;
            ffImp.separator = ";";
            ffImp.terminator = ";";
            ffImp.verticalMode = true;
            cdmObject.arrayGetFriendlyFormat(ffImp, this.imports);
            ff.addChild(ffImp);


            let ffDef = new friendlyFormatNode();
            ffDef.indentChildren = false;
            ffDef.separator = ";\n";
            ffDef.terminator = ";";
            ffDef.verticalMode = true;
            cdmObject.arrayGetFriendlyFormat(ffDef, this.definitions);
            ff.addChild(ffDef);
            return ff;
        }
        //return p.measure(bodyCode);
    }

    public constructResolvedAttributes(wrtDoc: ICdmDocumentDef): ResolvedAttributeSetBuilder
    {
        //let bodyCode = () =>
        {
            return null;
        }
        //return p.measure(bodyCode);
    }
    public constructResolvedTraits(rtsb: ResolvedTraitSetBuilder)
    {
        //let bodyCode = () =>
        {
            return null;
        }
        //return p.measure(bodyCode);
    }

    public static instanceFromData(name: string, path: string, object: any): Document
    {
        //let bodyCode = () =>
        {

            let doc: Document = new Document(name, object.imports);
            doc.path = path;

            if (object.$schema)
                doc.schema = object.$schema;
            if (object.jsonSchemaSemanticVersion)
                doc.schemaVersion = object.jsonSchemaSemanticVersion;
            if (object.imports) {
                let l = object.imports.length;
                for (let i = 0; i < l; i++) {
                    doc.imports.push(ImportImpl.instanceFromData(object.imports[i]));
                }
            }
            if (object.definitions) {
                let l = object.definitions.length;
                for (let i = 0; i < l; i++) {
                    const d = object.definitions[i];
                    if (d.dataTypeName)
                        doc.definitions.push(DataTypeImpl.instanceFromData(d));
                    else if (d.relationshipName)
                        doc.definitions.push(RelationshipImpl.instanceFromData(d));
                    else if (d.attributeGroupName)
                        doc.definitions.push(AttributeGroupImpl.instanceFromData(d));
                    else if (d.traitName)
                        doc.definitions.push(TraitImpl.instanceFromData(d));
                    else if (d.entityShape)
                        doc.definitions.push(ConstantEntityImpl.instanceFromData(d));
                    else if (d.entityName)
                        doc.definitions.push(EntityImpl.instanceFromData(d));
                }
            }
            return doc;
        }
        //return p.measure(bodyCode);
    }

    public addImport(uri: string, moniker: string): void
    {
        //let bodyCode = () =>
        {
            if (!this.imports)
                this.imports = new Array<ImportImpl>();
            let i = new ImportImpl(uri, moniker);
            i.ctx = this.ctx;
            this.imports.push(i)
            
        }
        //return p.measure(bodyCode);
    }
    public getImports(): ICdmImport[]
    {
        //let bodyCode = () =>
        {
            return this.imports;
        }
        //return p.measure(bodyCode);
    }

    public addDefinition<T>(ofType: cdmObjectType, name: string): T
    {
        //let bodyCode = () =>
        {
            let newObj: any = Corpus.MakeObject(ofType, name);
            if (newObj != null)
                this.definitions.push(newObj);
            return newObj;
        }
        //return p.measure(bodyCode);
    }

    public getSchema(): string
    {
        //let bodyCode = () =>
        {
            return this.schema;
        }
        //return p.measure(bodyCode);
    }
    public getName(): string
    {
        //let bodyCode = () =>
        {
            return this.name;
        }
        //return p.measure(bodyCode);
    }
    public setName(name: string): string
    {
        //let bodyCode = () =>
        {
            this.name = name;
            return this.name;
        }
        //return p.measure(bodyCode);
    }
    public getSchemaVersion(): string
    {
        //let bodyCode = () =>
        {
            return this.schemaVersion;
        }
        //return p.measure(bodyCode);
    }
    public getDefinitions(): (ICdmTraitDef | ICdmDataTypeDef | ICdmRelationshipDef | ICdmAttributeGroupDef | ICdmEntityDef | ICdmConstantEntityDef)[]
    {
        //let bodyCode = () =>
        {
            return this.definitions;
        }
        //return p.measure(bodyCode);
    }
    public visit(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean
    {
        //let bodyCode = () =>
        {
            if (preChildren && preChildren(this, pathFrom))
                return false;
            if (this.definitions)
                if (cdmObject.visitArray(this.definitions, pathFrom, preChildren, postChildren))
                    return true;
            if (postChildren && postChildren(this, pathFrom))
                return true;
            return false;
        }
        //return p.measure(bodyCode);
    }

    public indexImports(directory: Map<Document, Folder>)
    {
        //let bodyCode = () =>
        {
            this.extenalDeclarationCache = undefined;
            if (this.imports) {
                let l = this.imports.length;
                // put monikered imports into a set for named access and 
                // and add them first (so searched last) to the flat imports for a scan
                for (let i = 0; i < l; i++) {
                    const imp = this.imports[i];
                    let docLocal = imp.doc;
                    if (docLocal) {
                        if (imp.moniker && imp.moniker.length > 0) {
                            if (!this.monikeredImports.has(imp.moniker))
                                this.monikeredImports.set(imp.moniker, docLocal);
                            this.flatImports.push(docLocal);
                        }
                    }
                }
                // now the non named imports
                for (let i = 0; i < l; i++) {
                    const imp = this.imports[i];
                    if (imp.doc) {
                        if (!imp.moniker || imp.moniker.length == 0) 
                            this.flatImports.push(imp.doc);
                    }
                }

            }
            // if there is only one flat import, then don't make a local cache context.
            // later we will just search in that one doc
            if (this.monikeredImports.size > 0 || this.flatImports.length > 1)
                this.extenalDeclarationCache = new Map<string, [cdmObjectDef, boolean]>();
        }
        //return p.measure(bodyCode);
    }

    public getObjectFromDocumentPath(objectPath: string): ICdmObject
    {
        //let bodyCode = () =>
        {
            // in current document?
            if (this.internalDeclarations.has(objectPath))
                return this.internalDeclarations.get(objectPath);
            return null;
        }
        //return p.measure(bodyCode);
    }

    public resolveString(ctx: resolveContext, str: string, avoid : Set<Document>): namedReferenceResolution
    {
        //let bodyCode = () =>
        {
            // prevents loops in imports
            if (avoid.has(this))
                return undefined;
            avoid.add(this);

            let found : namedReferenceResolution = {};

            // first check local declarations, then seach the includes
            found.toObjectDef = this.internalDeclarations.get(str);
            if (!found.toObjectDef) {
                if (!this.extenalDeclarationCache) {
                    // signal there is 0 or 1 import only
                    if (this.flatImports.length)
                        found = this.flatImports[0].resolveString(ctx, str, avoid);
                }
                else {
                    // cached ?
                    let ext = this.extenalDeclarationCache.get(str);
                    if (ext) {
                        found.toObjectDef = ext["0"];
                        found.viaMoniker = ext["1"];
                    }
                    else {
                        // see if there is a prefix that might match one of the imports
                        let preEnd = str.indexOf('/');
                        if (preEnd == 0) {
                            // absolute refererence
                            ctx.statusRpt(cdmStatusLevel.error, "no support for absolute references yet. fix '" + str + "'", ctx.relativePath);
                            return undefined;
                        }
                        if (preEnd > 0) {
                            let prefix = str.slice(0, preEnd);
                            let newRef = str.slice(preEnd + 1);
                            if (this.monikeredImports && this.monikeredImports.has(prefix)) { 
                                found = this.monikeredImports.get(prefix).resolveString(ctx,  newRef, avoid);
                                if (found)
                                    found.viaMoniker = true;
                            }
                        }
                        if (found && !found.toObjectDef) {
                            // look through the flat list of imports
                            // do this from bottom up so that the last imported declaration for a duplicate name is found first
                            let imps = this.flatImports.length;
                            for (let imp = imps - 1; imp >= 0; imp--) {
                                let impDoc = this.flatImports[imp];
                                found = impDoc.resolveString(ctx,  str, avoid);
                                if (found) {
                                    found.viaMoniker=false;
                                    break;
                                }
                            }
                        }
                        // cache the external find
                        if (found && found.toObjectDef) {
                            this.extenalDeclarationCache.set(str, [found.toObjectDef, found.viaMoniker]);
                        }
                    }
                }
            }

            if (!found || !found.toObjectDef)
                return undefined;
            
            if (found.underCtx == undefined)
                found.underCtx = ctx;
            if (found.usingDoc == undefined)
                found.usingDoc = found.underCtx.currentDoc;
            if (found.viaMoniker == undefined) 
                found.viaMoniker = false;
            return found;
        }
    //return p.measure(bodyCode);
    }

}


////////////////////////////////////////////////////////////////////////////////////////////////////
//  {folderDef}
////////////////////////////////////////////////////////////////////////////////////////////////////
export class Folder extends cdmObjectSimple implements ICdmFolderDef
{
    name: string;
    relativePath: string;
    subFolders?: Folder[];
    documents?: ICdmDocumentDef[];
    corpus: Corpus;
    documentLookup: Map<string, ICdmDocumentDef>;
    public objectType: cdmObjectType;
    constructor(corpus: Corpus, name: string, parentPath: string)
    {
        super();
        //let bodyCode = () =>
        {

            this.corpus = corpus;
            this.name = name;
            this.relativePath = parentPath + name + "/";
            this.subFolders = new Array<Folder>();
            this.documents = new Array<Document>();
            this.documentLookup = new Map<string, ICdmDocumentDef>();
            this.objectType = cdmObjectType.folderDef;
        }
        //return p.measure(bodyCode);
    }

    public getName(): string
    {
        //let bodyCode = () =>
        {
            return this.name;
        }
        //return p.measure(bodyCode);
    }
    public validate(): boolean
    {
        //let bodyCode = () =>
        {
            return this.name ? true : false;
        }
        //return p.measure(bodyCode);
    }
    public getRelativePath(): string
    {
        //let bodyCode = () =>
        {
            return this.relativePath;
        }
        //return p.measure(bodyCode);
    }
    public getSubFolders(): ICdmFolderDef[]
    {
        //let bodyCode = () =>
        {
            return this.subFolders;
        }
        //return p.measure(bodyCode);
    }
    public getDocuments(): ICdmDocumentDef[]
    {
        //let bodyCode = () =>
        {
            return this.documents;
        }
        //return p.measure(bodyCode);
    }

    public addFolder(name: string): ICdmFolderDef
    {
        //let bodyCode = () =>
        {
            let newFolder: Folder = new Folder(this.corpus, name, this.relativePath);
            this.subFolders.push(newFolder);
            return newFolder;
        }
        //return p.measure(bodyCode);
    }

    public addDocument(name: string, content: any): ICdmDocumentDef
    {
        //let bodyCode = () =>
        {
            let doc: Document;
            if (this.documentLookup.has(name))
                return;
            if (content == null || content == "")
                doc = Document.instanceFromData(name, this.relativePath, new Document(name, false));
            else if (typeof (content) === "string")
                doc = Document.instanceFromData(name, this.relativePath, JSON.parse(content));
            else
                doc = Document.instanceFromData(name, this.relativePath, content);
            doc.ctx = this.ctx;
            this.documents.push(doc);
            this.corpus.addDocumentObjects(this, doc);
            this.documentLookup.set(name, doc);
            return doc;
        }
        //return p.measure(bodyCode);
    }

    public getSubFolderFromPath(path: string, makeFolder = true): ICdmFolderDef
    {
        //let bodyCode = () =>
        {
            let name: string;
            let remainingPath: string;
            let first: number = path.indexOf('/', 0);
            if (first < 0) {
                name = path.slice(0);
                remainingPath = "";
            }
            else {
                name = path.slice(0, first);
                remainingPath = path.slice(first + 1);
            }
            if (name.toUpperCase() == this.name.toUpperCase()) {
                // the end?
                if (remainingPath.length <= 2)
                    return this;
                // check children folders
                let result: Folder;
                if (this.subFolders) {
                    this.subFolders.some(f =>
                    {
                        result = f.getSubFolderFromPath(remainingPath, makeFolder) as Folder;
                        if (result)
                            return true;
                    });
                }
                if (result)
                    return result;

                if (makeFolder) {
                    // huh, well need to make the fold here
                    first = remainingPath.indexOf('/', 0);
                    name = remainingPath.slice(0, first);
                    return this.addFolder(name).getSubFolderFromPath(remainingPath, makeFolder);
                }
                else {
                    // good enough, return where we got to
                    return this;
                }
            }
            return null;
        }
        //return p.measure(bodyCode);
    }

    public getObjectFromFolderPath(objectPath: string): ICdmObject
    {
        //let bodyCode = () =>
        {

            let docName: string;
            let remainingPath: string;
            let first: number = objectPath.indexOf('/', 0);
            if (first < 0) {
                remainingPath = "";
                docName = objectPath;
            }
            else {
                remainingPath = objectPath.slice(first + 1);
                docName = objectPath.substring(0, first);
            }
            // got that doc?
            if (this.documentLookup.has(docName)) {
                let doc = this.documentLookup.get(docName);
                // all that is needed ?
                if (remainingPath.length < 2)
                    return doc;
                // doc will resolve it
                return doc.getObjectFromDocumentPath(remainingPath);
            }
            return null;
        }
        //return p.measure(bodyCode);
    }

    public getObjectType(): cdmObjectType
    {
        //let bodyCode = () =>
        {
            return cdmObjectType.folderDef;
        }
        //return p.measure(bodyCode);
    }
    // required by base but makes no sense... should refactor
    public visit(pathFrom: string, preChildren: VisitCallback, postChildren: VisitCallback): boolean
    {
        //let bodyCode = () =>
        {
            return false;
        }
        //return p.measure(bodyCode);
    }
    public getObjectDef<T=ICdmObjectDef>(): T
    {
        //let bodyCode = () =>
        {
            return null;
        }
        //return p.measure(bodyCode);
    }
    public copyData(wrtDoc:ICdmDocumentDef, stringRefs?: boolean): Folder
    {
        //let bodyCode = () =>
        {
            return null;
        }
        //return p.measure(bodyCode);
    }
    getResolvedTraits(wrtDoc: ICdmDocumentDef, set?: cdmTraitSet): ResolvedTraitSet
    {
        //let bodyCode = () =>
        {
            return null;
        }
        //return p.measure(bodyCode);
    }
    public setTraitParameterValue(wrtDoc : ICdmDocumentDef, toTrait: ICdmTraitDef, paramName: string, value: ArgumentValue)
    {
        //let bodyCode = () =>
        {

        }
        //return p.measure(bodyCode);
    }
    getResolvedAttributes(): ResolvedAttributeSet
    {
        //let bodyCode = () =>
        {
            return null;
        }
        //return p.measure(bodyCode);
    }
    public copy(wrtDoc: ICdmDocumentDef): ICdmObject
    {
        //let bodyCode = () =>
        {
            return null;
        }
        //return p.measure(bodyCode);
    }
    public getFriendlyFormat(): friendlyFormatNode
    {
        //let bodyCode = () =>
        {
            return null;
        }
        //return p.measure(bodyCode);
    }

}


////////////////////////////////////////////////////////////////////////////////////////////////////
//  {Corpus}
////////////////////////////////////////////////////////////////////////////////////////////////////
class resolveContextScope
{
    currentEntity?: ICdmEntityDef;
    currentAtttribute?: ICdmAttributeDef;
    currentTrait?: ICdmTraitDef;
    currentParameter?: number;
}

interface namedReferenceResolution {
    // a resolution for a string name to another object
    // result is an object definition, store the context and document
    // where the resolution happened.
    // track the fact that resolution was by explicit use of a moniker import
    toObjectDef?: cdmObjectDef;
    underCtx? : resolveContext;
    usingDoc? : Document;
    viaMoniker? : boolean;
}

class resolveContext
{
    constructor(statusRpt?: RptCallback, reportAtLevel?: cdmStatusLevel, errorAtLevel? : cdmStatusLevel)
    {
        this.reportAtLevel = reportAtLevel;
        this.errorAtLevel = errorAtLevel
        this.statusRpt = statusRpt;
        this.cache = new Map<string, any>();
    }
    scopeStack: Array<resolveContextScope>;
    currentScope: resolveContextScope;
    reportAtLevel: cdmStatusLevel;
    errorAtLevel: cdmStatusLevel;
    statusRpt: RptCallback;
    currentDoc?: Document;
    relativePath?: string;
    corpusPathRoot?: string;
    errors? : number;
    cache : Map<string, any>;

    public setDocumentContext(currentDoc?: Document, corpusPathRoot?: string)
    {
        //let bodyCode = () =>
        {
            if (currentDoc)
                this.currentDoc = currentDoc;
            if (corpusPathRoot)
                this.corpusPathRoot = corpusPathRoot;
        }
        //return p.measure(bodyCode);
    }
    public pushScope(currentEntity?: ICdmEntityDef, currentAtttribute?: ICdmAttributeDef, currentTrait?: ICdmTraitDef)
    {
        //let bodyCode = () =>
        {
            if (!this.scopeStack)
                this.scopeStack = new Array<resolveContextScope>();
    
            let ctxNew: resolveContextScope = { 
                currentEntity: currentEntity ? currentEntity : (this.currentScope ? this.currentScope.currentEntity : undefined),
                currentAtttribute: currentAtttribute ? currentAtttribute : (this.currentScope ? this.currentScope.currentAtttribute : undefined),
                currentTrait: currentTrait ? currentTrait : (this.currentScope ? this.currentScope.currentTrait : undefined),
                currentParameter: 0
            };
            this.currentScope = ctxNew;
            this.scopeStack.push(ctxNew);
        }
        //return p.measure(bodyCode);
    }

    public popScope()
    {
        //let bodyCode = () =>
        {
            this.scopeStack.pop();
            this.currentScope = this.scopeStack.length ? this.scopeStack[this.scopeStack.length - 1] : undefined;
        }
        //return p.measure(bodyCode);
    }

    public resolveNamedReference(str : string, expectedType : cdmObjectType) : namedReferenceResolution {
        //let bodyCode = () =>
        {
            let found = this.currentDoc.resolveString(this, str, new Set<Document>());
            // found something, is it the right type?
            if (found && expectedType != cdmObjectType.error) {
                switch (expectedType) {
                    case cdmObjectType.attributeGroupRef:
                        if (!(found.toObjectDef instanceof AttributeGroupImpl)) {
                            this.statusRpt(cdmStatusLevel.error, "expected type attributeGroup", this.relativePath);
                            found = null;
                        }
                        break;
                    case cdmObjectType.dataTypeRef:
                        if (!(found.toObjectDef instanceof DataTypeImpl)) {
                            this.statusRpt(cdmStatusLevel.error, "expected type dataType", this.relativePath);
                            found = null;
                        }
                        break;
                    case cdmObjectType.entityRef:
                        if (!(found.toObjectDef instanceof EntityImpl)) {
                            this.statusRpt(cdmStatusLevel.error, "expected type entity", this.relativePath);
                            found = null;
                        }
                        break;
                    case cdmObjectType.parameterDef:
                        if (!(found.toObjectDef instanceof ParameterImpl)) {
                            this.statusRpt(cdmStatusLevel.error, "expected type parameter", this.relativePath);
                            found = null;
                        }
                        break;
                    case cdmObjectType.relationshipRef:
                        if (!(found.toObjectDef instanceof RelationshipImpl)) {
                            this.statusRpt(cdmStatusLevel.error, "expected type relationship", this.relativePath);
                            found = null;
                        }
                        break;
                    case cdmObjectType.traitRef:
                        if (!(found.toObjectDef instanceof TraitImpl)) {
                            this.statusRpt(cdmStatusLevel.error, "expected type trait", this.relativePath);
                            found = null;
                        }
                        break;
                }
            }
            return found;
        }
        //return p.measure(bodyCode);
    }

    public getCache(forObj : cdmObject, wrtDoc: ICdmDocumentDef, kind : string) : any {
        //let bodyCode = () =>
        {
            let key=forObj.ID.toString() + "_" + (wrtDoc ? wrtDoc.ID.toString() : "NULL") + "_" + kind;
            let res= this.cache.get(key);
            return res;
        }
        //return p.measure(bodyCode);
    }
    public setCache(forObj : cdmObject, wrtDoc: ICdmDocumentDef, kind : string, value : any) {
        //let bodyCode = () =>
        {
            let key=forObj.ID.toString() + "_" + (wrtDoc ? wrtDoc.ID.toString() : "NULL") + "_" + kind;
            this.cache.set(key, value);
        }
        //return p.measure(bodyCode);
    }

}

export class Corpus extends Folder
{
    static _nextID = 0;
    rootPath: string;
    allDocuments?: [Folder, Document][];
    directory: Map<Document, Folder>;
    pathLookup: Map<string, [Folder, Document]>;
    constructor(rootPath: string)
    {
        super(null, "", "");
        //let bodyCode = () =>
        {
            this.corpus = this; // well ... it is
            this.rootPath = rootPath;
            this.allDocuments = new Array<[Folder, Document]>();
            this.pathLookup = new Map<string, [Folder, Document]>();
            this.directory = new Map<Document, Folder>();
            this.ctx = new resolveContext((level, msg, path) => {
                if (level >= this.ctx.errorAtLevel)
                    this.ctx.errors++; 
            });
        }
        //return p.measure(bodyCode);
    }

    public static nextID() {
        this._nextID++;
        return this._nextID;
    }

    public static MakeRef(ofType: cdmObjectType, refObj: string | ICdmObjectDef, simpleNameRef : boolean): ICdmObjectRef
    {
        //let bodyCode = () =>
        {
            let oRef: ICdmObjectRef;

            if (refObj) {
                if (typeof (refObj) === "string")
                    oRef = this.MakeObject<ICdmObjectRef>(ofType, refObj, simpleNameRef);
                else {
                    if (refObj.objectType == ofType) {
                        // forgive this mistake, return the ref passed in
                        oRef = (refObj as any) as ICdmObjectRef;
                    }
                    else {
                        oRef = this.MakeObject<ICdmObjectRef>(ofType);
                        (oRef as ICdmObjectRef).setObjectDef(refObj);
                    }
                }
            }
            return oRef;
        }
        //return p.measure(bodyCode);
    }
    public static MakeObject<T=ICdmObject>(ofType: cdmObjectType, nameOrRef?: string, simmpleNameRef? : boolean): T
    {
        //let bodyCode = () =>
        {
            let newObj: ICdmObject = null;

            switch (ofType) {
                case cdmObjectType.argumentDef:
                    newObj = new ArgumentImpl();
                    (newObj as ArgumentImpl).name = nameOrRef;
                    break;
                case cdmObjectType.attributeGroupDef:
                    newObj = new AttributeGroupImpl(nameOrRef);
                    break;
                case cdmObjectType.attributeGroupRef:
                    newObj = new AttributeGroupReferenceImpl(nameOrRef, simmpleNameRef);
                    break;
                case cdmObjectType.constantEntityDef:
                    newObj = new ConstantEntityImpl();
                    (newObj as ConstantEntityImpl).constantEntityName = nameOrRef;
                    break;
                case cdmObjectType.dataTypeDef:
                    newObj = new DataTypeImpl(nameOrRef, null, false);
                    break;
                case cdmObjectType.dataTypeRef:
                    newObj = new DataTypeReferenceImpl(nameOrRef, simmpleNameRef, false);
                    break;
                case cdmObjectType.documentDef:
                    newObj = new Document(name, false);
                    break;
                case cdmObjectType.entityAttributeDef:
                    newObj = new EntityAttributeImpl(false);
                    (newObj as EntityAttributeImpl).entity = this.MakeRef(cdmObjectType.entityRef, nameOrRef, simmpleNameRef) as any;
                    break;
                case cdmObjectType.entityDef:
                    newObj = new EntityImpl(nameOrRef, null, false, false);
                    break;
                case cdmObjectType.entityRef:
                    newObj = new EntityReferenceImpl(nameOrRef, simmpleNameRef, false);
                    break;
                case cdmObjectType.import:
                    newObj = new ImportImpl(nameOrRef);
                    break;
                case cdmObjectType.parameterDef:
                    newObj = new ParameterImpl(nameOrRef);
                    break;
                case cdmObjectType.relationshipDef:
                    newObj = new RelationshipImpl(nameOrRef, null, false);
                    break;
                case cdmObjectType.relationshipRef:
                    newObj = new RelationshipReferenceImpl(nameOrRef, simmpleNameRef, false);
                    break;
                case cdmObjectType.traitDef:
                    newObj = new TraitImpl(nameOrRef, null, false);
                    break;
                case cdmObjectType.traitRef:
                    newObj = new TraitReferenceImpl(nameOrRef, simmpleNameRef, false);
                    break;
                case cdmObjectType.typeAttributeDef:
                    newObj = new TypeAttributeImpl(nameOrRef, false);
                    break;
            }
            return newObj as any;
        }
        //return p.measure(bodyCode);
    }

    public addDocumentObjects(folder: Folder, docDef: ICdmDocumentDef): ICdmDocumentDef
    {
        //let bodyCode = () =>
        {
            let doc: Document = docDef as Document;
            let path = doc.path + doc.name;
            if (!this.pathLookup.has(path)) {
                this.allDocuments.push([folder, doc]);
                this.pathLookup.set(path, [folder, doc]);
                this.directory.set(doc, folder);
            }
            return doc;
        }
        //return p.measure(bodyCode);
    }

    public addDocumentFromContent(uri: string, content: string): ICdmDocumentDef
    {
        //let bodyCode = () =>
        {
            let last: number = uri.lastIndexOf('/');
            if (last < 0)
                throw new Error("bad path");
            let name: string = uri.slice(last + 1);
            let path: string = uri.slice(0, last + 1);
            let folder: ICdmFolderDef = this.getSubFolderFromPath(path, true);
            if (folder == null && path == "/")
                folder = this;
            return folder.addDocument(name, content);
        }
        //return p.measure(bodyCode);
    }

    public listMissingImports(): Set<string>
    {
        //let bodyCode = () =>
        {
            let missingSet: Set<string> = new Set<string>();
            let l = this.allDocuments.length;
            for (let i = 0; i < l; i++) {
                const fd = this.allDocuments[i];
                if (fd["1"].imports) {
                    fd["1"].imports.forEach(imp =>
                    {
                        if (!imp.doc) {
                            // no document set for this import, see if it is already loaded into the corpus
                            let path = imp.uri;
                            if (path.charAt(0) != '/')
                                path = fd["0"].getRelativePath() + imp.uri;
                            let lookup: [Folder, Document] = this.pathLookup.get(path);
                            if (lookup)
                                imp.doc = lookup["1"];
                            else
                                missingSet.add(path);
                        }
                    });
                }
            }

            if (missingSet.size == 0)
                return undefined;
            return missingSet;
        }
        //return p.measure(bodyCode);
    }

    public getObjectFromCorpusPath(objectPath: string)
    {
        //let bodyCode = () =>
        {

            if (objectPath && objectPath.indexOf('/') == 0) {
                let lastFolder = this.getSubFolderFromPath(objectPath, false); // don't create new folders, just go as far as possible
                if (lastFolder) {
                    // maybe the seach is for a folder?
                    let lastPath = lastFolder.getRelativePath();
                    if (lastPath === objectPath)
                        return lastFolder;

                    // remove path to folder and then look in the folder 
                    objectPath = objectPath.slice(lastPath.length);
                    return lastFolder.getObjectFromFolderPath(objectPath);
                }

            }
            return null;

        }
        //return p.measure(bodyCode);
    }

    public setResolutionCallback(status: RptCallback, reportAtLevel: cdmStatusLevel = cdmStatusLevel.info, errorAtLevel: cdmStatusLevel = cdmStatusLevel.warning) {
        this.ctx.reportAtLevel = reportAtLevel;
        this.ctx.errorAtLevel = errorAtLevel;
        this.ctx.errors = 0;
        this.ctx.statusRpt =
            (level, msg, path) => {
                if (level >= this.ctx.errorAtLevel)
                    this.ctx.errors++; 
                if (level >= this.ctx.reportAtLevel)
                    status(level, msg, path);
            };
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //  resolve imports
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    public resolveImports(importResolver: (uri: string) => Promise<[string, string]>): Promise<boolean>
    {
        //let bodyCode = () =>
        {
            return new Promise<boolean>(resolve =>
            {

                let missingSet: Set<string> = this.listMissingImports();
                let result = true;

                let turnMissingImportsIntoClientPromises = () =>
                {
                    if (missingSet) {
                        // turn each missing into a promise for a missing from the caller
                        missingSet.forEach(missing =>
                        {
                            importResolver(missing).then((success: [string, string]) =>
                            {
                                if (result) {
                                    // a new document for the corpus
                                    this.addDocumentFromContent(success[0], success[1]);

                                    // remove this from set
                                    missingSet.delete(success[0]);
                                    this.ctx.statusRpt(cdmStatusLevel.progress, `resolved import '${success[0]}'`, "");
                                    // if this is the last import, check to see if more are needed now and recurse 
                                    if (missingSet.size == 0) {
                                        missingSet = this.listMissingImports();
                                        turnMissingImportsIntoClientPromises();
                                    }
                                }
                            }, (fail: [string, string]) =>
                                {
                                    result = false;
                                    // something went wrong with one of the imports, give up on all of it
                                    this.ctx.statusRpt(cdmStatusLevel.error, `failed to import '${fail[0]}' for reason : ${fail[1]}`, this.getRelativePath());
                                    resolve(result);
                                })
                        });
                    }
                    else {
                        // nothing was missing, so just move to next resolve step
                        resolve(result);
                    }
                }

                turnMissingImportsIntoClientPromises();

            });
        }
        //return p.measure(bodyCode);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    //  resolve references
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    declareObjectDefinitions(relativePath: string)
    {
        //let bodyCode = () =>
        {
            let ctx = this.ctx;
            ctx.currentDoc.visit(relativePath, (iObject: ICdmObject, path: string) =>
            {
                if (path.indexOf("(unspecified)") > 0)
                    return true;
                switch (iObject.objectType) {
                    case cdmObjectType.entityDef:
                        (iObject as EntityImpl).docDeclared = ctx.currentDoc;
                        (iObject as EntityImpl).ctxDefault = ctx;
                    case cdmObjectType.parameterDef:
                    case cdmObjectType.traitDef:
                    case cdmObjectType.relationshipDef:
                    case cdmObjectType.dataTypeDef:
                    case cdmObjectType.typeAttributeDef:
                    case cdmObjectType.entityAttributeDef:
                    case cdmObjectType.attributeGroupDef:
                    case cdmObjectType.constantEntityDef:
                        ctx.relativePath = relativePath;
                        let corpusPath = ctx.corpusPathRoot + '/' + path;
                        if (ctx.currentDoc.internalDeclarations.has(path)) {
                            ctx.statusRpt(cdmStatusLevel.error, `duplicate declaration for item '${path}'`, corpusPath);
                            return false;
                        }
                        ctx.currentDoc.internalDeclarations.set(path, iObject as cdmObjectDef);
                        (iObject as cdmObjectDef).corpusPath = corpusPath;
                        ctx.statusRpt(cdmStatusLevel.info, `declared '${path}'`, corpusPath);
                        break;
                }

                return false
            }, null);
        }
        //return p.measure(bodyCode);
    }

    constTypeCheck(paramDef: ICdmParameterDef, aValue: ArgumentValue) : ArgumentValue
    {
        //let bodyCode = () =>
        {
            let ctx = this.ctx;
            let wrtDoc = ctx.currentDoc as ICdmDocumentDef;
            let replacement = aValue;
            // if parameter type is entity, then the value should be an entity or ref to one
            // same is true of 'dataType' dataType
            if (paramDef.getDataTypeRef()) {
                let dt = paramDef.getDataTypeRef().getObjectDef<ICdmDataTypeDef>(wrtDoc);
                if (!dt)
                    dt = paramDef.getDataTypeRef().getObjectDef<ICdmDataTypeDef>(wrtDoc);
                // compare with passed in value or default for parameter
                let pValue = aValue;
                if (!pValue) {
                    pValue = paramDef.getDefaultValue();
                    replacement = pValue;
                }
                if (pValue) {
                    if (dt.isDerivedFrom(wrtDoc, "cdmObject")) {
                        let expectedTypes: cdmObjectType[] = new Array<cdmObjectType>();
                        let expected: string;
                        if (dt.isDerivedFrom(wrtDoc, "entity")) {
                            expectedTypes.push(cdmObjectType.constantEntityDef);
                            expectedTypes.push(cdmObjectType.entityRef);
                            expectedTypes.push(cdmObjectType.entityDef);
                            expected = "entity";
                        }
                        else if (dt.isDerivedFrom(wrtDoc, "attribute")) {
                            expectedTypes.push(cdmObjectType.attributeRef);
                            expectedTypes.push(cdmObjectType.typeAttributeDef);
                            expectedTypes.push(cdmObjectType.entityAttributeDef);
                            expected = "attribute";
                        }
                        else if (dt.isDerivedFrom(wrtDoc, "dataType")) {
                            expectedTypes.push(cdmObjectType.dataTypeRef);
                            expectedTypes.push(cdmObjectType.dataTypeDef);
                            expected = "dataType";
                        }
                        else if (dt.isDerivedFrom(wrtDoc, "relationship")) {
                            expectedTypes.push(cdmObjectType.relationshipRef);
                            expectedTypes.push(cdmObjectType.relationshipDef);
                            expected = "relationship";
                        }
                        else if (dt.isDerivedFrom(wrtDoc, "trait")) {
                            expectedTypes.push(cdmObjectType.traitRef);
                            expectedTypes.push(cdmObjectType.traitDef);
                            expected = "trait";
                        }
                        else if (dt.isDerivedFrom(wrtDoc, "attributeGroup")) {
                            expectedTypes.push(cdmObjectType.attributeGroupRef);
                            expectedTypes.push(cdmObjectType.attributeGroupDef);
                            expected = "attributeGroup";
                        }

                        if (expectedTypes.length == 0)
                            ctx.statusRpt(cdmStatusLevel.error, `parameter '${paramDef.getName()}' has an unexpected dataType.`, ctx.currentDoc.path + ctx.relativePath);

                        // if a string constant, resolve to an object ref.
                        let foundType = cdmObjectType.error;
                        if (typeof(pValue) === "object")
                            foundType = (pValue as ICdmObject).objectType;
                        let foundDesc: string = ctx.relativePath;
                        if (typeof(pValue) === "string") {
                            foundDesc = pValue;
                            if (foundDesc == "this.attribute" && expected == "attribute") {
                                replacement = new AttributeReferenceImpl("this.attribute", true);
                                (replacement as AttributeReferenceImpl).ctx = ctx;
                                let res : namedReferenceResolution = {};
                                res.toObjectDef = (ctx.currentScope ? ctx.currentScope.currentAtttribute : undefined) as any;
                                ctx.setCache(replacement as cdmObject, ctx.currentDoc, "nameResolve", res);
                                foundType = cdmObjectType.attributeRef;
                            }
                            else if (foundDesc == "this.trait" && expected == "trait") {
                                replacement = ctx.currentScope.currentTrait as any;
                                foundType = cdmObjectType.traitDef;
                            }
                            else if (foundDesc == "this.entity" && expected == "entity") {
                                replacement = ctx.currentScope.currentEntity as any;
                                foundType = cdmObjectType.entityDef;
                            }
                            else {
                                let resAttToken = "/(resolvedAttributes)/";
                                let seekResAtt = pValue.indexOf(resAttToken);
                                if (seekResAtt >= 0) {
                                    // get an object there that will get resolved later
                                    replacement = new AttributeReferenceImpl(pValue, true);
                                    (replacement as AttributeReferenceImpl).ctx = ctx;
                                    foundType = cdmObjectType.attributeRef;
                                }
                                else {
                                    let lu = ctx.resolveNamedReference(pValue, cdmObjectType.error);
                                    if (lu) {
                                        replacement = lu.toObjectDef;
                                        foundType = (replacement as ICdmObject).objectType;
                                    }
                                }
                            }
                        }
                        if (expectedTypes.indexOf(foundType) == -1)
                            ctx.statusRpt(cdmStatusLevel.error, `parameter '${paramDef.getName()}' has the dataType of '${expected}' but the value '${foundDesc}' does't resolve to a known ${expected} referenece`, ctx.currentDoc.path + ctx.relativePath);
                        else {
                            ctx.statusRpt(cdmStatusLevel.info, `    resolved '${foundDesc}'`, ctx.relativePath);
                        }
                    }
                }
            }
            return replacement;
        }
        //return p.measure(bodyCode);
    }


    resolveObjectDefinitions()
    {
        //let bodyCode = () =>
        {
            let ctx = this.ctx;
            ctx.currentDoc.visit("", (iObject: ICdmObject, path: string) =>
            {
                let ot: cdmObjectType = iObject.objectType;
                switch (ot) {
                    case cdmObjectType.entityDef:
                        ctx.pushScope(iObject as ICdmEntityDef);
                        break;
                    case cdmObjectType.typeAttributeDef:
                    case cdmObjectType.entityAttributeDef:
                        ctx.pushScope(undefined, iObject as ICdmAttributeDef);
                        break;
                    case cdmObjectType.attributeGroupRef:
                    case cdmObjectType.dataTypeRef:
                    case cdmObjectType.entityRef:
                    case cdmObjectType.relationshipRef:
                    case cdmObjectType.traitRef:
                        ctx.relativePath = path;
                        let ref = iObject as cdmObjectRef;
                        // see if a cache has already happened
                        let res = this.ctx.getCache(ref, null, "nameResolve") as namedReferenceResolution;
                        if (!res)
                            res = this.ctx.getCache(ref, ctx.currentDoc, "nameResolve") as namedReferenceResolution;
                        if (ref.namedReference && !res) {
                            // no, so look up the thing now
                            let found = ctx.resolveNamedReference(ref.namedReference, ot);
                            if (!found) {
                                // it is 'ok' to not find entity refs sometimes
                                let level = (ot == cdmObjectType.entityRef) ? cdmStatusLevel.warning : cdmStatusLevel.error;
                                ctx.statusRpt(level, `unable to resolve the reference '${ref.namedReference}' to a known object`, ctx.currentDoc.path + path);
                            }
                            else {
                                ref.monikeredDocument = found.viaMoniker ? ctx.currentDoc : undefined; 
                                ctx.statusRpt(cdmStatusLevel.info, `    resolved '${ref.namedReference}'`, ctx.currentDoc.path + path);
                            }
                        }
                        break;
                }
                return false
            }, (iObject: ICdmObject, path: string) =>
                {
                    let ot: cdmObjectType = iObject.objectType;
                    switch (ot) {
                        case cdmObjectType.entityDef:
                        case cdmObjectType.typeAttributeDef:
                        case cdmObjectType.entityAttributeDef:
                            ctx.popScope();
                            break;
                        case cdmObjectType.parameterDef:
                            // when a parameter has a datatype of 'entity' and a default value, then the default value should be a constant entity or ref to one
                            let p: ICdmParameterDef = iObject as ICdmParameterDef;
                            this.constTypeCheck(p, null);
                            break;
                    }
                    return false
                });
        }
        //return p.measure(bodyCode);
    }

    finishResolve()
    {
        //let bodyCode = () =>
        {
            let ctx = this.ctx;
            ////////////////////////////////////////////////////////////////////////////////////////////////////
            //  cleanup references
            ////////////////////////////////////////////////////////////////////////////////////////////////////
            ctx.statusRpt(cdmStatusLevel.progress, "finishing...", null);
            // turn elevated traits back on, they are off by default and should work fully now that everything is resolved
            let l = this.allDocuments.length;
            for (let i = 0; i < l; i++) {
                const fd = this.allDocuments[i];
                let doc = fd["1"];
                doc.visit("", (iObject: ICdmObject, path: string) =>
                {
                    let obj = (iObject as cdmObject);
                    obj.skipElevated = false;
                    obj.rtsbAll = null;
                    return false;
                }, null);
            };
    
            p.report();
            if (visits) {
                let max = 0;
                let maxVisit = "";
                visits.forEach((v, k) =>
                {
                    if (v > 250) {
                        max = v;
                        maxVisit = k;
                    }
                });
                console.log(`${maxVisit}, ${max}`);
            }
        }
        //return p.measure(bodyCode);
    }


    public resolveReferencesAndValidate(stage: cdmValidationStep, stageThrough: cdmValidationStep): Promise<cdmValidationStep>
    {
        //let bodyCode = () =>
        {
            return new Promise<cdmValidationStep>(resolve =>
            {
                let errors: number = 0;
                let ctx = this.ctx;

                ////////////////////////////////////////////////////////////////////////////////////////////////////
                //  folder imports
                ////////////////////////////////////////////////////////////////////////////////////////////////////
                if (stage == cdmValidationStep.start || stage == cdmValidationStep.imports) {
                    ctx.statusRpt(cdmStatusLevel.progress, "importing documents...", null);
                    stage = cdmValidationStep.imports;

                    let l = this.allDocuments.length;
                    for (let i = 0; i < l; i++) {
                        const fd = this.allDocuments[i];
                        // cache import documents
                        ctx.currentDoc = fd["1"];
                        ctx.currentDoc.indexImports(this.directory);
                        ctx.currentDoc = undefined;
                    };

                    if (errors > 0) {
                        resolve(cdmValidationStep.error);
                    }
                    else {
                        if (stageThrough == stage) {
                            this.finishResolve();
                            resolve(cdmValidationStep.finished);
                        }
                        else 
                            resolve(cdmValidationStep.integrity);
                    }
                    return;
                }
                else if (stage == cdmValidationStep.integrity) {
                    ////////////////////////////////////////////////////////////////////////////////////////////////////
                    //  integrity
                    ////////////////////////////////////////////////////////////////////////////////////////////////////
                    ctx.statusRpt(cdmStatusLevel.progress, "basic object integrity...", null);

                    // for each document, see if any object doesn't have the basic required shape
                    let l = this.allDocuments.length;
                    for (let i = 0; i < l; i++) {
                        const fd = this.allDocuments[i];
                        ctx.currentDoc = fd["1"];
                        ctx.currentDoc.visit("", (iObject: ICdmObject, path: string) =>
                        {
                            if (iObject.validate() == false) {
                                ctx.statusRpt(cdmStatusLevel.error, `integrity check failed for : '${path}'`, ctx.currentDoc.path + path);
                            } else 
                                (iObject as cdmObject).ctx = ctx;
                                ctx.statusRpt(cdmStatusLevel.info, `checked '${path}'`, ctx.currentDoc.path + path);
                            return false
                        }, null);
                        ctx.currentDoc = undefined;
                    }

                    if (errors > 0) {
                        resolve(cdmValidationStep.error);
                    }
                    else {
                        if (stageThrough == stage) {
                            this.finishResolve();
                            resolve(cdmValidationStep.finished);
                        }
                        else 
                            resolve(cdmValidationStep.declarations);
                    }
                    return;
                }
                else if (stage == cdmValidationStep.declarations) {
                    ////////////////////////////////////////////////////////////////////////////////////////////////////
                    //  declarations
                    ////////////////////////////////////////////////////////////////////////////////////////////////////
                    ctx.statusRpt(cdmStatusLevel.progress, "making declarations...", null);

                    // for each document, make a directory of the objects that are declared within it with a path relative to the doc
                    // the rules are that any declared object with a name or an attribute with a name adds the name to a path
                    let l = this.allDocuments.length;
                    for (let i = 0; i < l; i++) {
                        const fd = this.allDocuments[i];
                        ctx.currentDoc = fd["1"];
                        ctx.corpusPathRoot = ctx.currentDoc.path + ctx.currentDoc.name;
                        this.declareObjectDefinitions("");
                        ctx.currentDoc = undefined;
                    }

                    if (errors > 0) {
                        resolve(cdmValidationStep.error);
                    }
                    else {
                        if (stageThrough == stage) {
                            this.finishResolve();
                            resolve(cdmValidationStep.finished);
                        }
                        else 
                            resolve(cdmValidationStep.references);
                    }
                    return;
                }
                else if (stage === cdmValidationStep.references) {
                    ////////////////////////////////////////////////////////////////////////////////////////////////////
                    //  references
                    ////////////////////////////////////////////////////////////////////////////////////////////////////

                    // for each document, find each explicit or implicit reference and search for the object named. 
                    // if the name starts with a moniker for one of the imports, then look through that import first else look through the main document first.
                    // if not found, look through any of the imported documents that have no moniker in listed order. depth first avoiding cycles
                    // if any imports have not been resolved to documents, skip them
                    ctx.statusRpt(cdmStatusLevel.progress, "resolving references...", null);

                    let l = this.allDocuments.length;
                    for (let i = 0; i < l; i++) {
                        const fd = this.allDocuments[i];
                        ctx.currentDoc = fd["1"];
                        this.resolveObjectDefinitions();
                        ctx.currentDoc = undefined;                        
                    };

                    if (errors > 0)
                        resolve(cdmValidationStep.error);
                    else {
                        if (stageThrough == stage) {
                            this.finishResolve();
                            resolve(cdmValidationStep.finished);
                        }
                        else 
                            resolve(cdmValidationStep.parameters);
                    }
                    return;
                }
                else if (stage == cdmValidationStep.parameters) {
                    ////////////////////////////////////////////////////////////////////////////////////////////////////
                    //  parameters
                    ////////////////////////////////////////////////////////////////////////////////////////////////////
                    ctx.statusRpt(cdmStatusLevel.progress, "binding parameters...", null);

                    // tie arguments to the parameter for the referenced trait
                    // if type is 'entity' and  value is a string, then resolve like a ref 
                    // calling getAllParameters will validate that there are no duplicate params in the inheritence chain of the trait
                    // calling resolveParameter will fail if there is no match on the given name or ordinal
                    let l = this.allDocuments.length;
                    for (let i = 0; i < l; i++) {
                        const fd = this.allDocuments[i];
                        ctx.currentDoc = fd["1"];

                        ctx.currentDoc.visit("", (iObject: ICdmObject, path: string) =>
                        {
                            let ot: cdmObjectType = iObject.objectType;
                            switch (ot) {
                                case cdmObjectType.entityDef:
                                    ctx.pushScope(iObject as ICdmEntityDef);
                                    break;
                                case cdmObjectType.typeAttributeDef:
                                case cdmObjectType.entityAttributeDef:
                                    ctx.pushScope(undefined, iObject as ICdmAttributeDef);
                                    break;
                                case cdmObjectType.traitRef:
                                    ctx.pushScope(undefined, undefined, iObject.getObjectDef<ICdmTraitDef>(ctx.currentDoc));
                                    break;
                                case cdmObjectType.argumentDef:
                                    try {
                                        ctx.relativePath = path;
                                        let params: ParameterCollection = ctx.currentScope.currentTrait.getAllParameters(ctx.currentDoc);
                                        let paramFound: ICdmParameterDef;
                                        let aValue: ArgumentValue;
                                        if (ot == cdmObjectType.argumentDef) {
                                            paramFound = params.resolveParameter(ctx.currentScope.currentParameter, (iObject as ICdmArgumentDef).getName());
                                            (iObject as ArgumentImpl).resolvedParameter = paramFound;
                                            aValue = (iObject as ArgumentImpl).value;

                                            // if parameter type is entity, then the value should be an entity or ref to one
                                            // same is true of 'dataType' dataType
                                            aValue = this.constTypeCheck(paramFound, aValue);
                                            (iObject as ArgumentImpl).setValue(aValue);
                                        }

                                    }
                                    catch (e) {
                                        ctx.statusRpt(cdmStatusLevel.error, e.toString(), path);
                                        ctx.statusRpt(cdmStatusLevel.error, `failed to resolve parameter on trait '${ctx.currentScope.currentTrait.getName()}'`, ctx.currentDoc.path + path);
                                    }
                                    ctx.currentScope.currentParameter++;
                                    break;
                            }
                            return false;
                        }, (iObject: ICdmObject, path: string) =>
                            {
                                let ot: cdmObjectType = iObject.objectType;
                                switch (ot) {
                                    case cdmObjectType.entityDef:
                                    case cdmObjectType.typeAttributeDef:
                                    case cdmObjectType.entityAttributeDef:
                                    case cdmObjectType.traitRef:
                                        ctx.popScope()
                                        break;
                                }
                                return false;
                            });
                        ctx.currentDoc = undefined;
                    };

                    if (errors > 0)
                        resolve(cdmValidationStep.error);
                    else {
                        if (stageThrough == stage) {
                            this.finishResolve();
                            resolve(cdmValidationStep.finished);
                        }
                        else 
                            resolve(cdmValidationStep.traits);
                    }
                    return;
                }
                else if (stage == cdmValidationStep.traits) {

                    ctx.statusRpt(cdmStatusLevel.progress, "resolving traits...", null);

                    let assignAppliers = (traitMatch: ICdmTraitDef, traitAssign: ICdmTraitDef) =>
                    {
                        if (!traitMatch)
                            return;
                        if (traitMatch.getExtendsTrait())
                            assignAppliers(traitMatch.getExtendsTrait().getObjectDef(ctx.currentDoc), traitAssign);
                        let traitName = traitMatch.getName();
                        // small number of matcher
                        PrimitiveAppliers.forEach(applier =>
                        {
                            if (applier.matchName == traitName)
                                traitAssign.addTraitApplier(applier);
                        });

                    }
                    let l = this.allDocuments.length;
                    for (let i = 0; i < l; i++) {
                        const fd = this.allDocuments[i];
                        ctx.currentDoc = fd["1"];
                        ctx.currentDoc.visit("", (iObject: ICdmObject, path: string) =>
                        {
                            switch (iObject.objectType) {
                                case cdmObjectType.traitDef:
                                    // add trait appliers to this trait from base class on up
                                    assignAppliers(iObject as ICdmTraitDef, iObject as ICdmTraitDef);
                                    break;
                            }
                            return false;
                        }, null);
                        ctx.currentDoc = undefined;
                    };

                    // for every defined object, find and cache the full set of traits that are exhibited or applied during inheritence 
                    // and for each get a mapping of values (starting with default values) to parameters build from the base declaration up to the final
                    // so that any overrides done along the way take precidence.
                    // for trait definition, consider that when extending a base trait arguments can be applied.
                    for (let i = 0; i < l; i++) {
                        const fd = this.allDocuments[i];
                        ctx.currentDoc = fd["1"];
                        ctx.currentDoc.visit("", (iObject: ICdmObject, path: string) =>
                        {
                            switch (iObject.objectType) {
                                case cdmObjectType.traitDef:
                                case cdmObjectType.relationshipDef:
                                case cdmObjectType.dataTypeDef:
                                case cdmObjectType.entityDef:
                                case cdmObjectType.attributeGroupDef:
                                    ctx.relativePath = path;
                                    (iObject as ICdmObjectDef).getResolvedTraits(ctx.currentDoc);
                                    break;
                                case cdmObjectType.entityAttributeDef:
                                case cdmObjectType.typeAttributeDef:
                                    ctx.relativePath = path;
                                    (iObject as ICdmAttributeDef).getResolvedTraits(ctx.currentDoc);
                                    break;
                            }
                            return false;
                        }, null);
                        ctx.currentDoc = undefined;
                    };

                    ctx.statusRpt(cdmStatusLevel.progress, "checking required arguments...", null);

                    let checkRequiredParamsOnResolvedTraits = (obj: ICdmObject) =>
                    {
                        let rts = obj.getResolvedTraits(ctx.currentDoc);
                        if (rts) {
                            let l = rts.size;
                            for (let i = 0; i < l; i++) {
                                const rt = rts.set[i];
                                let found = 0;
                                let resolved = 0;
                                if (rt.parameterValues) {
                                    let l = rt.parameterValues.length;
                                    for (let iParam = 0; iParam < l; iParam++) {
                                        if (rt.parameterValues.getParameter(iParam).getRequired()) {
                                            found++;
                                            if (!rt.parameterValues.getValue(iParam))
                                                ctx.statusRpt(cdmStatusLevel.error, `no argument supplied for required parameter '${rt.parameterValues.getParameter(iParam).getName()}' of trait '${rt.traitName}' on '${obj.getObjectDef(ctx.currentDoc).getName()}'`, ctx.currentDoc.path + ctx.relativePath);
                                            else
                                                resolved++;
                                        }
                                    }
                                }
                                if (found > 0 && found == resolved)
                                    ctx.statusRpt(cdmStatusLevel.info, `found and resolved '${found}' required parameters of trait '${rt.traitName}' on '${obj.getObjectDef(ctx.currentDoc).getName()}'`, ctx.currentDoc.path + ctx.relativePath);
                            }
                        }
                    }

                    // now make sure that within the definition of an entity, every usage of a trait has values or default values for all required params
                    let inEntityDef = 0;
                    for (let i = 0; i < l; i++) {
                        const fd = this.allDocuments[i];
                        ctx.currentDoc = fd["1"];
                        ctx.currentDoc.visit("", null, (iObject: ICdmObject, path: string) =>
                        {
                            let ot: cdmObjectType = iObject.objectType;
                            if (ot == cdmObjectType.entityDef) {
                                ctx.relativePath = path;
                                // get the resolution of all parameters and values through inheritence and defaults and arguments, etc.
                                checkRequiredParamsOnResolvedTraits(iObject);
                                // do the same for all attributes
                                if ((iObject as ICdmEntityDef).getHasAttributeDefs()) {
                                    (iObject as ICdmEntityDef).getHasAttributeDefs().forEach((attDef) =>
                                    {
                                        checkRequiredParamsOnResolvedTraits(attDef as ICdmObject);
                                    });
                                }
                            }
                            if (ot == cdmObjectType.attributeGroupDef) {
                                ctx.relativePath = path;
                                // get the resolution of all parameters and values through inheritence and defaults and arguments, etc.
                                checkRequiredParamsOnResolvedTraits(iObject);
                                // do the same for all attributes
                                if ((iObject as ICdmAttributeGroupDef).getMembersAttributeDefs()) {
                                    (iObject as ICdmAttributeGroupDef).getMembersAttributeDefs().forEach((attDef) =>
                                    {
                                        checkRequiredParamsOnResolvedTraits(attDef as ICdmObject);
                                    });
                                }
                            }
                            return false;
                        });
                        ctx.currentDoc = undefined;                        
                    };

                    if (errors > 0)
                        resolve(cdmValidationStep.error);
                    else {
                        if (stageThrough == stage) {
                            this.finishResolve();
                            resolve(cdmValidationStep.finished);
                        }
                        else 
                            resolve(cdmValidationStep.attributes);
                    }
                    return;
                }
                else if (stage == cdmValidationStep.attributes) {
                    ////////////////////////////////////////////////////////////////////////////////////////////////////
                    //  attributes
                    ////////////////////////////////////////////////////////////////////////////////////////////////////
                    ctx.statusRpt(cdmStatusLevel.progress, "resolving attributes...", null);

                    // moving on ...
                    // for each entity, find and cache the complete set of attributes
                    // attributes definitions originate from and then get modified by subsequent re-defintions from (in this order):
                    // an extended entity, traits applied to extended entity, exhibited traits of main entity, the (datatype or entity) used as an attribute, traits applied to that datatype or entity,
                    // the relationsip of the attribute, the attribute definition itself and included attribute groups, any traits applied to the attribute.
                    // make sure there are no duplicates in the final step

                    let l = this.allDocuments.length;
                    for (let i = 0; i < l; i++) {
                        const fd = this.allDocuments[i];
                        ctx.currentDoc = fd["1"];
                        ctx.currentDoc.visit("", (iObject: ICdmObject, path: string) =>
                        {
                            let ot: cdmObjectType = iObject.objectType;
                            if (ot == cdmObjectType.entityDef) {
                                ctx.relativePath = path;
                                (iObject as ICdmEntityDef).getResolvedAttributes(ctx.currentDoc);
                            }
                            if (ot == cdmObjectType.attributeGroupDef) {
                                ctx.relativePath = path;
                                (iObject as ICdmAttributeGroupDef).getResolvedAttributes(ctx.currentDoc);
                            }
                            return false;
                        }, null);
                        ctx.currentDoc = undefined;
                    };

                    if (errors > 0)
                        resolve(cdmValidationStep.error);
                    else {
                        if (stageThrough == stage) {
                            this.finishResolve();
                            resolve(cdmValidationStep.finished);
                        }
                        else 
                            resolve(cdmValidationStep.entityReferences);
                    }
                    return;
                }
                else if (stage == cdmValidationStep.entityReferences) {
                    ////////////////////////////////////////////////////////////////////////////////////////////////////
                    //  entity references
                    ////////////////////////////////////////////////////////////////////////////////////////////////////
                    ctx.statusRpt(cdmStatusLevel.progress, "resolving foreign key references...", null);
                    // for each entity, find and cache the complete set of references to other entities made through referencesA relationships
                    let l = this.allDocuments.length;
                    for (let i = 0; i < l; i++) {
                        const fd = this.allDocuments[i];
                        ctx.currentDoc = fd["1"];
                        ctx.currentDoc.visit("", (iObject: ICdmObject, path: string) =>
                        {
                            let ot: cdmObjectType = iObject.objectType;
                            if (ot == cdmObjectType.entityDef) {
                                ctx.relativePath = path;
                                (iObject as ICdmEntityDef).getResolvedEntityReferences(ctx.currentDoc);
                            }
                            return false;
                        }, null);
                        ctx.currentDoc = undefined;
                    };

                    if (errors > 0)
                        resolve(cdmValidationStep.error);
                    else {
                        if (stageThrough == stage) {
                            this.finishResolve();
                            resolve(cdmValidationStep.finished);
                        }
                        else {
                            this.finishResolve();
                            resolve(cdmValidationStep.finished);
                        }
                    return;
                    }
                }
                // bad step sent in
                resolve(cdmValidationStep.error);
            });
        }
        //return p.measure(bodyCode);
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
//
//  appliers to support the traits from 'primitives.cmd'
//
////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////

let PrimitiveAppliers: traitApplier[] = [
    {
        matchName: "is.removed",
        priority: 10,
        attributeRemove: (wrtDoc: ICdmDocumentDef, resAtt: ResolvedAttribute, resTrait: ResolvedTrait): ApplierResult =>
        {
            return { "shouldDelete": true };
        }
    },
    {
        matchName: "does.addAttribute",
        priority: 9,
        willAdd: (wrtDoc: ICdmDocumentDef, resAtt: ResolvedAttribute, resTrait: ResolvedTrait): boolean =>
        {
            return true;
        },
        attributeAdd: (wrtDoc: ICdmDocumentDef, resAtt: ResolvedAttribute, resTrait: ResolvedTrait, continuationState: any): ApplierResult =>
        {
            // get the added attribute and applied trait
            let sub = resTrait.parameterValues.getParameterValue("addedAttribute").value as ICdmAttributeDef;
            //sub = sub.copy();
            let appliedTrait = resTrait.parameterValues.getParameterValue("appliedTrait").value;
            if (appliedTrait) {
                sub.addAppliedTrait(appliedTrait as any, false); // could be a def or ref or string handed in. this handles it
            }
            return { "addedAttribute": sub };
        }
    },
    {
        matchName: "does.referenceEntity",
        priority: 8,
        attributeRemove: (wrtDoc: ICdmDocumentDef, resAtt: ResolvedAttribute, resTrait: ResolvedTrait): ApplierResult =>
        {
            let visible = true;
            if (resAtt) {
                // all others go away
                visible = false;
                if (resAtt.attribute === resTrait.parameterValues.getParameterValue("addedAttribute").value)
                    visible = true;
            }
            return { "shouldDelete": !visible };
        }
    },
    {
        matchName: "does.addSupportingAttribute",
        priority: 8,
        willAdd: (wrtDoc: ICdmDocumentDef, resAtt: ResolvedAttribute, resTrait: ResolvedTrait): boolean =>
        {
            return true;
        },
        attributeAdd: (wrtDoc: ICdmDocumentDef, resAtt: ResolvedAttribute, resTrait: ResolvedTrait, continuationState: any): ApplierResult =>
        {
            // get the added attribute and applied trait
            let sub = resTrait.parameterValues.getParameterValue("addedAttribute").value as ICdmAttributeDef;
            sub = sub.copy(wrtDoc);
            let appliedTrait = resTrait.parameterValues.getParameterValue("appliedTrait").value;
            if (typeof(appliedTrait) === "object") {
                appliedTrait = (appliedTrait as ICdmObjectRef).getObjectDef(wrtDoc);
                // shove new trait onto attribute
                sub.addAppliedTrait(appliedTrait as any, false); // could be a def or ref or string handed in. this handles it
                let supporting = "(unspecified)"
                if (resAtt)
                    supporting = resAtt.resolvedName
                sub.setTraitParameterValue(wrtDoc, appliedTrait as ICdmTraitDef, "inSupportOf", supporting);

                return { "addedAttribute": sub };
            }
        }
    },
    {
        matchName: "is.array",
        priority: 6,
        willAdd: (wrtDoc: ICdmDocumentDef, resAtt: ResolvedAttribute, resTrait: ResolvedTrait): boolean =>
        {
            return resAtt ? true : false;
        },
        attributeAdd: (wrtDoc: ICdmDocumentDef, resAtt: ResolvedAttribute, resTrait: ResolvedTrait, continuationState: any): ApplierResult =>
        {
            let newAtt: ICdmAttributeDef;
            let newContinue: { curentOrdinal: number, finalOrdinal: number, renameTrait: ICdmTraitRef };
            if (resAtt) {
                if (!continuationState) {
                    // get the fixed size (not set means no fixed size)
                    let fixedSizeString = resTrait.parameterValues.getParameterValue("fixedSize").getValueString(wrtDoc);
                    if (fixedSizeString && fixedSizeString != "undefined") {
                        let fixedSize = Number.parseInt(fixedSizeString);
                        let renameTrait = resTrait.parameterValues.getParameterValue("renameTrait").value;
                        if (renameTrait && typeof(renameTrait) === "object") {
                            let ordinal = Number.parseInt((renameTrait as ICdmObject).getResolvedTraits(wrtDoc).first.parameterValues.getParameterValue("ordinal").getValueString(wrtDoc));
                            continuationState = { curentOrdinal: ordinal, finalOrdinal: ordinal + fixedSize - 1, renameTrait: renameTrait };
                        }
                    }
                }

                if (continuationState) {
                    if (continuationState.curentOrdinal <= continuationState.finalOrdinal) {
                        newAtt = resAtt.attribute.copy(wrtDoc);
                        // add the rename trait to the new attribute
                        let newRenameTraitRef = continuationState.renameTrait.copy();
                        (newRenameTraitRef as ICdmTraitRef).setArgumentValue("ordinal", continuationState.curentOrdinal.toString());
                        newAtt.addAppliedTrait(newRenameTraitRef, false);
                        // and get rid of is.array trait
                        newAtt.removeTraitDef(wrtDoc, resTrait.trait);

                        continuationState.curentOrdinal++;
                        if (continuationState.curentOrdinal > continuationState.finalOrdinal)
                            continuationState = null;
                    }
                }
            }
            return { "addedAttribute": newAtt, "continuationState": continuationState };
        },
        attributeRemove: (wrtDoc: ICdmDocumentDef, resAtt: ResolvedAttribute, resTrait: ResolvedTrait): ApplierResult =>
        {
            // array attributes get removed after being enumerated
            return { "shouldDelete": true };
        }
    },
    {
        matchName: "does.renameWithFormat",
        priority: 6,
        willApply: (wrtDoc: ICdmDocumentDef, resAtt: ResolvedAttribute, resTrait: ResolvedTrait): boolean =>
        {
            return (resAtt ? true : false);
        },
        attributeApply: (wrtDoc: ICdmDocumentDef, resAtt: ResolvedAttribute, resTrait: ResolvedTrait): ApplierResult =>
        {
            if (resAtt) {
                let format = resTrait.parameterValues.getParameterValue("renameFormat").getValueString(wrtDoc);
                let ordinal = resTrait.parameterValues.getParameterValue("ordinal").getValueString(wrtDoc);
                if (!format)
                    return { "shouldDelete": false };
                let formatLength = format.length;
                if (formatLength == 0)
                    return { "shouldDelete": false };
                // parse the format looking for positions of {n} and {o} and text chunks around them
                // there are only 5 possibilies
                let iN = format.indexOf("{n}");
                let iO = format.indexOf("{o}");
                let replace = (start: number, at: number, length: number, value: string): string =>
                {
                    let replaced: string = "";
                    if (at > start)
                        replaced = format.slice(start, at);
                    replaced += value;
                    if (at + 3 < length)
                        replaced += format.slice(at + 3, length);
                    return replaced;
                }
                let result: string;
                if (iN < 0 && iO < 0) {
                    result = format;
                }
                else if (iN < 0) {
                    result = replace(0, iO, formatLength, ordinal);
                }
                else if (iO < 0) {
                    result = replace(0, iN, formatLength, resAtt.resolvedName);
                } else if (iN < iO) {
                    result = replace(0, iN, iO, resAtt.resolvedName);
                    result += replace(iO, iO, formatLength, ordinal);
                } else {
                    result = replace(0, iO, iN, ordinal);
                    result += replace(iN, iN, formatLength, resAtt.resolvedName);
                }
                resAtt.resolvedName = result;
            }
            return { "shouldDelete": false };;
        }
    }
];  
