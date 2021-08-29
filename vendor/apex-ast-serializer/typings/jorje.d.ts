/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 2.32.889 on 2021-08-27 18:11:42.

export interface ParserOutput {
    internalErrors: InternalException[];
    parseErrors: ParseException[];
    unit: CompilationUnit;
    hiddenTokenMap: { [index: string]: HiddenToken };
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.semantic.compiler.parser.ParserOutput";
}

export interface CompilationUnitBuilder {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.CompilationUnitBuilder";
}

export interface Identifier extends Locatable {
    value: string;
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface Identifiers {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.Identifiers";
}

export interface LocationIdentifier extends Identifier {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.Identifiers$LocationIdentifier";
}

export interface SyntheticIdentifier extends Identifier {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.Identifiers$SyntheticIdentifier";
}

export interface IndexLocation extends Location {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.IndexLocation";
}

export interface JadtTester {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.JadtTester";
}

export interface Locatable {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface Locatables {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.Locatables";
}

export interface Location extends Locatable {
    startIndex: number;
    column: number;
    endIndex: number;
    line: number;
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface LocationBlocks {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.LocationBlocks";
}

export interface Locations {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.Locations";
}

export interface PositionLocation extends Location {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.PositionLocation";
}

export interface SwitchTester {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.SwitchTester";
}

export interface TypeRefBuilder {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.TypeRefBuilder";
}

export interface AnnotationParameter {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface AnnotationKeyValue extends AnnotationParameter {
    loc: Location;
    key: Identifier;
    value: AnnotationValue;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.AnnotationParameter$AnnotationKeyValue";
}

export interface AnnotationString extends AnnotationParameter {
    loc: Location;
    value: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.AnnotationParameter$AnnotationString";
}

export interface AnnotationValue {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface FalseAnnotationValue extends AnnotationValue {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.AnnotationValue$FalseAnnotationValue";
}

export interface StringAnnotationValue extends AnnotationValue {
    loc: Location;
    value: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.AnnotationValue$StringAnnotationValue";
}

export interface TrueAnnotationValue extends AnnotationValue {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.AnnotationValue$TrueAnnotationValue";
}

export interface BlockMember {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface FieldMember extends BlockMember {
    variableDecls: VariableDecls;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.BlockMember$FieldMember";
}

export interface InnerClassMember extends BlockMember {
    body: ClassDecl;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.BlockMember$InnerClassMember";
}

export interface InnerEnumMember extends BlockMember {
    body: EnumDecl;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.BlockMember$InnerEnumMember";
}

export interface InnerInterfaceMember extends BlockMember {
    body: InterfaceDecl;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.BlockMember$InnerInterfaceMember";
}

export interface MethodMember extends BlockMember {
    methodDecl: MethodDecl;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.BlockMember$MethodMember";
}

export interface PropertyMember extends BlockMember {
    propertyDecl: PropertyDecl;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.BlockMember$PropertyMember";
}

export interface StaticStmntBlockMember extends BlockMember {
    loc: Location;
    stmnt: Stmnt;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.BlockMember$StaticStmntBlockMember";
}

export interface StmntBlockMember extends BlockMember {
    stmnt: Stmnt;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.BlockMember$StmntBlockMember";
}

export interface CatchBlock {
    loc: Location;
    parameter: ParameterRef;
    stmnt: Stmnt;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.CatchBlock";
}

export interface ClassDecl {
    loc: Location;
    modifiers: Modifier[];
    name: Identifier;
    typeArguments?: Identifier[];
    members: BlockMember[];
    superClass?: TypeRef;
    interfaces: TypeRef[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.ClassDecl";
}

export interface CompilationUnit {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface AnonymousBlockUnit extends CompilationUnit {
    members: BlockMember[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.CompilationUnit$AnonymousBlockUnit";
}

export interface ClassDeclUnit extends CompilationUnit {
    body: ClassDecl;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.CompilationUnit$ClassDeclUnit";
}

export interface EnumDeclUnit extends CompilationUnit {
    body: EnumDecl;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.CompilationUnit$EnumDeclUnit";
}

export interface InterfaceDeclUnit extends CompilationUnit {
    body: InterfaceDecl;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.CompilationUnit$InterfaceDeclUnit";
}

export interface InvalidDeclUnit extends CompilationUnit {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.CompilationUnit$InvalidDeclUnit";
}

export interface TriggerDeclUnit extends CompilationUnit {
    loc: Location;
    name: Identifier;
    target: Identifier[];
    isBulk: boolean;
    usages: TriggerUsage[];
    members: BlockMember[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.CompilationUnit$TriggerDeclUnit";
}

export interface ElseBlock {
    loc: Location;
    stmnt: Stmnt;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.ElseBlock";
}

export interface EnumDecl {
    loc: Location;
    modifiers: Modifier[];
    name: Identifier;
    members: Identifier[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.EnumDecl";
}

export interface Expr {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface ArrayExpr extends Expr {
    expr: Expr;
    index: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$ArrayExpr";
}

export interface AssignmentExpr extends Expr {
    left: Expr;
    op: AssignmentOp;
    right: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$AssignmentExpr";
}

export interface BinaryExpr extends Expr {
    left: Expr;
    op: BinaryOp;
    right: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$BinaryExpr";
}

export interface BooleanExpr extends Expr {
    left: Expr;
    op: BooleanOp;
    right: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$BooleanExpr";
}

export interface CastExpr extends Expr {
    loc: Location;
    expr: Expr;
    type: TypeRef;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$CastExpr";
}

export interface ClassRefExpr extends Expr {
    loc: Location;
    type: TypeRef;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$ClassRefExpr";
}

export interface InstanceOf extends Expr {
    expr: Expr;
    type: TypeRef;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$InstanceOf";
}

export interface JavaMethodCallExpr extends Expr {
    loc: Location;
    names: Identifier[];
    inputParameters: Expr[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$JavaMethodCallExpr";
}

export interface JavaVariableExpr extends Expr {
    loc: Location;
    names: Identifier[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$JavaVariableExpr";
}

export interface ExprLiteralExpr extends Expr {
    loc: Location;
    type: LiteralType;
    literal: any;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$LiteralExpr";
}

export interface MethodCallExpr extends Expr {
    dottedExpr?: Expr;
    isSafeNav: boolean;
    names: Identifier[];
    inputParameters: Expr[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$MethodCallExpr";
}

export interface NestedExpr extends Expr {
    expr: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$NestedExpr";
}

export interface NewExpr extends Expr {
    loc: Location;
    creator: NewObject;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$NewExpr";
}

export interface PackageVersionExpr extends Expr {
    loc: Location;
    version: VersionRef;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$PackageVersionExpr";
}

export interface PostfixExpr extends Expr {
    loc: Location;
    expr: Expr;
    op: PostfixOp;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$PostfixExpr";
}

export interface PrefixExpr extends Expr {
    loc: Location;
    expr: Expr;
    op: PrefixOp;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$PrefixExpr";
}

export interface SoqlExpr extends Expr {
    loc: Location;
    rawQuery: string;
    query: Query;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$SoqlExpr";
}

export interface SoslExpr extends Expr {
    loc: Location;
    rawQuery: string;
    search: Search;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$SoslExpr";
}

export interface SuperMethodCallExpr extends Expr {
    loc: Location;
    inputParameters: Expr[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$SuperMethodCallExpr";
}

export interface SuperVariableExpr extends Expr {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$SuperVariableExpr";
}

export interface TernaryExpr extends Expr {
    condition: Expr;
    trueExpr: Expr;
    falseExpr: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$TernaryExpr";
}

export interface ThisMethodCallExpr extends Expr {
    loc: Location;
    inputParameters: Expr[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$ThisMethodCallExpr";
}

export interface ThisVariableExpr extends Expr {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$ThisVariableExpr";
}

export interface TriggerVariableExpr extends Expr {
    loc: Location;
    variable: Identifier;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$TriggerVariableExpr";
}

export interface VariableExpr extends Expr {
    dottedExpr?: Expr;
    isSafeNav: boolean;
    names: Identifier[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Expr$VariableExpr";
}

export interface FinallyBlock {
    loc: Location;
    stmnt: Stmnt;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.FinallyBlock";
}

export interface ForControl {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface CStyleForControl extends ForControl {
    inits?: ForInits;
    condition?: Expr;
    control?: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.ForControl$CStyleForControl";
}

export interface EnhancedForControl extends ForControl {
    type: TypeRef;
    init: ForInit;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.ForControl$EnhancedForControl";
}

export interface ForInit {
    name: Identifier[];
    expr?: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.ForInit";
}

export interface ForInits {
    type?: TypeRef;
    inits: ForInit[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.ForInits";
}

export interface IfBlock {
    loc: Location;
    expr: Expr;
    stmnt: Stmnt;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.IfBlock";
}

export interface InterfaceDecl {
    loc: Location;
    modifiers: Modifier[];
    name: Identifier;
    typeArguments?: Identifier[];
    members: BlockMember[];
    superInterface?: TypeRef;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.InterfaceDecl";
}

export interface MapLiteralKeyValue {
    key: Expr;
    value: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.MapLiteralKeyValue";
}

export interface MethodDecl {
    modifiers: Modifier[];
    type?: TypeRef;
    name: Identifier;
    parameters: ParameterRef[];
    stmnt?: Stmnt;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.MethodDecl";
}

export interface Modifier {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface AbstractModifier extends Modifier {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Modifier$AbstractModifier";
}

export interface Annotation extends Modifier {
    loc: Location;
    name: Identifier;
    parameters: AnnotationParameter[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Modifier$Annotation";
}

export interface FinalModifier extends Modifier {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Modifier$FinalModifier";
}

export interface GlobalModifier extends Modifier {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Modifier$GlobalModifier";
}

export interface InheritedSharingModifier extends Modifier {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Modifier$InheritedSharingModifier";
}

export interface OverrideModifier extends Modifier {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Modifier$OverrideModifier";
}

export interface PrivateModifier extends Modifier {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Modifier$PrivateModifier";
}

export interface ProtectedModifier extends Modifier {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Modifier$ProtectedModifier";
}

export interface PublicModifier extends Modifier {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Modifier$PublicModifier";
}

export interface StaticModifier extends Modifier {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Modifier$StaticModifier";
}

export interface TestMethodModifier extends Modifier {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Modifier$TestMethodModifier";
}

export interface TransientModifier extends Modifier {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Modifier$TransientModifier";
}

export interface VirtualModifier extends Modifier {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Modifier$VirtualModifier";
}

export interface WebServiceModifier extends Modifier {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Modifier$WebServiceModifier";
}

export interface WithSharingModifier extends Modifier {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Modifier$WithSharingModifier";
}

export interface WithoutSharingModifier extends Modifier {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Modifier$WithoutSharingModifier";
}

export interface NameValueParameter {
    name: Identifier;
    value: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.NameValueParameter";
}

export interface NewObject {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface NewKeyValue extends NewObject {
    type: TypeRef;
    keyValues: NameValueParameter[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.NewObject$NewKeyValue";
}

export interface NewListInit extends NewObject {
    types: TypeRef[];
    expr?: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.NewObject$NewListInit";
}

export interface NewListLiteral extends NewObject {
    types: TypeRef[];
    values: Expr[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.NewObject$NewListLiteral";
}

export interface NewMapInit extends NewObject {
    types: TypeRef[];
    expr?: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.NewObject$NewMapInit";
}

export interface NewMapLiteral extends NewObject {
    types: TypeRef[];
    pairs: MapLiteralKeyValue[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.NewObject$NewMapLiteral";
}

export interface NewSetInit extends NewObject {
    types: TypeRef[];
    expr?: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.NewObject$NewSetInit";
}

export interface NewSetLiteral extends NewObject {
    types: TypeRef[];
    values: Expr[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.NewObject$NewSetLiteral";
}

export interface NewStandard extends NewObject {
    type: TypeRef;
    inputParameters: Expr[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.NewObject$NewStandard";
}

export interface ParameterRef {
    modifiers: Modifier[];
    name: Identifier;
    type: TypeRef;
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface ParameterRefs {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.ParameterRefs";
}

export interface EmptyModifierParameterRef extends ParameterRef {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.ParameterRefs$EmptyModifierParameterRef";
}

export interface ModifierParameterRef extends ParameterRef {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.ParameterRefs$ModifierParameterRef";
}

export interface PrinterBlocks {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.PrinterBlocks";
}

export interface PropertyDecl {
    modifiers: Modifier[];
    type: TypeRef;
    name: Identifier;
    getter?: PropertyGetter;
    setter?: PropertySetter;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.PropertyDecl";
}

export interface PropertyGetter {
    loc: Location;
    modifier?: Modifier;
    stmnt?: Stmnt;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.PropertyGetter";
}

export interface PropertySetter {
    loc: Location;
    modifier?: Modifier;
    stmnt?: Stmnt;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.PropertySetter";
}

export interface Stmnt {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface BlockStmnt extends Stmnt {
    loc: Location;
    stmnts: Stmnt[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Stmnt$BlockStmnt";
}

export interface BreakStmnt extends Stmnt {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Stmnt$BreakStmnt";
}

export interface ContinueStmnt extends Stmnt {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Stmnt$ContinueStmnt";
}

export interface DmlDeleteStmnt extends Stmnt {
    loc: Location;
    expr: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Stmnt$DmlDeleteStmnt";
}

export interface DmlInsertStmnt extends Stmnt {
    loc: Location;
    expr: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Stmnt$DmlInsertStmnt";
}

export interface DmlMergeStmnt extends Stmnt {
    loc: Location;
    expr1: Expr;
    expr2: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Stmnt$DmlMergeStmnt";
}

export interface DmlUndeleteStmnt extends Stmnt {
    loc: Location;
    expr: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Stmnt$DmlUndeleteStmnt";
}

export interface DmlUpdateStmnt extends Stmnt {
    loc: Location;
    expr: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Stmnt$DmlUpdateStmnt";
}

export interface DmlUpsertStmnt extends Stmnt {
    loc: Location;
    expr: Expr;
    id?: FieldIdentifier;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Stmnt$DmlUpsertStmnt";
}

export interface DoLoop extends Stmnt {
    loc: Location;
    stmnt: Stmnt;
    condition: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Stmnt$DoLoop";
}

export interface ExpressionStmnt extends Stmnt {
    loc: Location;
    expr: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Stmnt$ExpressionStmnt";
}

export interface ForLoop extends Stmnt {
    loc: Location;
    forControl: ForControl;
    stmnt?: Stmnt;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Stmnt$ForLoop";
}

export interface IfElseBlock extends Stmnt {
    ifBlocks: IfBlock[];
    elseBlock?: ElseBlock;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Stmnt$IfElseBlock";
}

export interface ReturnStmnt extends Stmnt {
    loc: Location;
    expr?: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Stmnt$ReturnStmnt";
}

export interface RunAsBlock extends Stmnt {
    loc: Location;
    inputParameters: Expr[];
    stmnt: Stmnt;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Stmnt$RunAsBlock";
}

export interface SwitchStmnt extends Stmnt {
    loc: Location;
    expr: Expr;
    whenBlocks: WhenBlock[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Stmnt$SwitchStmnt";
}

export interface ThrowStmnt extends Stmnt {
    loc: Location;
    expr: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Stmnt$ThrowStmnt";
}

export interface TryCatchFinallyBlock extends Stmnt {
    loc: Location;
    tryBlock: Stmnt;
    catchBlocks: CatchBlock[];
    finallyBlock?: FinallyBlock;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Stmnt$TryCatchFinallyBlock";
}

export interface VariableDeclStmnt extends Stmnt {
    variableDecls: VariableDecls;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Stmnt$VariableDeclStmnt";
}

export interface WhileLoop extends Stmnt {
    loc: Location;
    condition: Expr;
    stmnt?: Stmnt;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.Stmnt$WhileLoop";
}

export interface TypeRef {
    typeArguments: TypeRef[];
    names: Identifier[];
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface TypeRefs {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.TypeRefs";
}

export interface ArrayTypeRef extends TypeRef {
    heldType: TypeRef;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.TypeRefs$ArrayTypeRef";
}

export interface ClassTypeRef extends TypeRef {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.TypeRefs$ClassTypeRef";
}

export interface JavaTypeRef extends TypeRef {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.TypeRefs$JavaTypeRef";
}

export interface VariableDecl {
    name: Identifier;
    assignment?: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.VariableDecl";
}

export interface VariableDecls {
    modifiers: Modifier[];
    type: TypeRef;
    decls: VariableDecl[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.VariableDecls";
}

export interface VersionRef {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface RequestVersion extends VersionRef {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.VersionRef$RequestVersion";
}

export interface StructuredVersion extends VersionRef {
    major: number;
    minor: number;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.VersionRef$StructuredVersion";
}

export interface WhenBlock {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface ElseWhen extends WhenBlock {
    stmnt: Stmnt;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.WhenBlock$ElseWhen";
}

export interface TypeWhen extends WhenBlock {
    typeRef: TypeRef;
    name: Identifier;
    stmnt: Stmnt;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.WhenBlock$TypeWhen";
}

export interface ValueWhen extends WhenBlock {
    whenCases: WhenCase[];
    stmnt: Stmnt;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.WhenBlock$ValueWhen";
}

export interface WhenCase {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface EnumCase extends WhenCase {
    identifiers: Identifier[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.WhenCase$EnumCase";
}

export interface LiteralCase extends WhenCase {
    expr: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.ast.WhenCase$LiteralCase";
}

export interface LexicalError {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface InvalidControlChar extends LexicalError {
    loc: Location;
    character: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.LexicalError$InvalidControlChar";
}

export interface InvalidDate extends LexicalError {
    loc: Location;
    date: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.LexicalError$InvalidDate";
}

export interface InvalidDateTime extends LexicalError {
    loc: Location;
    dateTime: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.LexicalError$InvalidDateTime";
}

export interface InvalidIdentifier extends LexicalError {
    loc: Location;
    identifier: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.LexicalError$InvalidIdentifier";
}

export interface InvalidSymbol extends LexicalError {
    loc: Location;
    symbol: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.LexicalError$InvalidSymbol";
}

export interface InvalidTime extends LexicalError {
    loc: Location;
    time: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.LexicalError$InvalidTime";
}

export interface SymbolInUnexpectedSet extends LexicalError {
    loc: Location;
    found: string;
    unexpected: string[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.LexicalError$SymbolInUnexpectedSet";
}

export interface SymbolNotInExpectedSet extends LexicalError {
    loc: Location;
    found: string;
    expected: string[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.LexicalError$SymbolNotInExpectedSet";
}

export interface SymbolNotInRange extends LexicalError {
    loc: Location;
    found: string;
    begin: string;
    end: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.LexicalError$SymbolNotInRange";
}

export interface UnexpectedLexicalError extends LexicalError {
    loc: Location;
    message: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.LexicalError$UnexpectedLexicalError";
}

export interface UnexpectedSymbol extends LexicalError {
    loc: Location;
    found: string;
    expected: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.LexicalError$UnexpectedSymbol";
}

export interface UnrecognizedSymbol extends LexicalError {
    loc: Location;
    symbol: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.LexicalError$UnrecognizedSymbol";
}

export interface UnterminatedComment extends LexicalError {
    loc: Location;
    closeComment: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.LexicalError$UnterminatedComment";
}

export interface UnterminatedString extends LexicalError {
    loc: Location;
    quote: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.LexicalError$UnterminatedString";
}

export interface SyntaxError {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface IllegalDecimalLiteral extends SyntaxError {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.SyntaxError$IllegalDecimalLiteral";
}

export interface IllegalDoubleLiteral extends SyntaxError {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.SyntaxError$IllegalDoubleLiteral";
}

export interface IllegalIntegerLiteral extends SyntaxError {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.SyntaxError$IllegalIntegerLiteral";
}

export interface IllegalLongLiteral extends SyntaxError {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.SyntaxError$IllegalLongLiteral";
}

export interface IllegalStringLiteral extends SyntaxError {
    loc: Location;
    message: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.SyntaxError$IllegalStringLiteral";
}

export interface MismatchedSyntax extends SyntaxError {
    loc: Location;
    actual: string;
    expected: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.SyntaxError$MismatchedSyntax";
}

export interface MissingSyntax extends SyntaxError {
    loc: Location;
    actual: string;
    expected: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.SyntaxError$MissingSyntax";
}

export interface UnexpectedEof extends SyntaxError {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.SyntaxError$UnexpectedEof";
}

export interface UnexpectedSyntaxError extends SyntaxError {
    loc: Location;
    message: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.SyntaxError$UnexpectedSyntaxError";
}

export interface UnexpectedToken extends SyntaxError {
    loc: Location;
    token: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.SyntaxError$UnexpectedToken";
}

export interface UnmatchedSyntax extends SyntaxError {
    loc: Location;
    actual: string;
    expected: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.SyntaxError$UnmatchedSyntax";
}

export interface UserError {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface Lexical extends UserError {
    error: LexicalError;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.UserError$Lexical";
}

export interface Syntax extends UserError {
    error: SyntaxError;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.errors.UserError$Syntax";
}

export interface BindClause {
    loc: Location;
    exprs: BindExpr[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.BindClause";
}

export interface BindExpr {
    field: FieldIdentifier;
    value: QueryLiteral;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.BindExpr";
}

export interface CaseExpr {
    loc: Location;
    op: CaseOp;
    whenBranches: WhenExpr[];
    elseBranch?: ElseExpr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.CaseExpr";
}

export interface CaseOp {
    identifier: FieldIdentifier;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.CaseOp";
}

export interface ColonExpr {
    loc: Location;
    expr: Expr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.ColonExpr";
}

export interface DataCategory {
    type: FieldIdentifier;
    op: DataCategoryOperator;
    categories: FieldIdentifier[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.DataCategory";
}

export interface DataCategoryOperator {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface DataCategoryAbove extends DataCategoryOperator {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.DataCategoryOperator$DataCategoryAbove";
}

export interface DataCategoryAboveOrBelow extends DataCategoryOperator {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.DataCategoryOperator$DataCategoryAboveOrBelow";
}

export interface DataCategoryAt extends DataCategoryOperator {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.DataCategoryOperator$DataCategoryAt";
}

export interface DataCategoryBelow extends DataCategoryOperator {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.DataCategoryOperator$DataCategoryBelow";
}

export interface DistanceFunctionExpr {
    loc: Location;
    field: FieldIdentifier;
    location: Geolocation;
    unit: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.DistanceFunctionExpr";
}

export interface ElseExpr {
    loc: Location;
    identifiers: FieldIdentifier[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.ElseExpr";
}

export interface Field {
    field: FieldIdentifier;
    function1?: Identifier;
    function2?: Identifier;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.Field";
}

export interface FieldIdentifier {
    entity?: FieldIdentifier;
    field: Identifier;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.FieldIdentifier";
}

export interface FromClause {
    loc: Location;
    exprs: FromExpr[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.FromClause";
}

export interface FromExpr {
    table: FieldIdentifier;
    alias?: Identifier;
    using?: QueryUsingClause;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.FromExpr";
}

export interface Geolocation {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface GeolocationExpr extends Geolocation {
    expr: ColonExpr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.Geolocation$GeolocationExpr";
}

export interface GeolocationLiteral extends Geolocation {
    latitude: NumberClause;
    longitude: NumberClause;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.Geolocation$GeolocationLiteral";
}

export interface GroupByClause {
    loc: Location;
    type?: GroupByType;
    exprs: GroupByExpr[];
    having?: HavingClause;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.GroupByClause";
}

export interface GroupByExpr {
    field: Field;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.GroupByExpr";
}

export interface GroupByType {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface GroupByCube extends GroupByType {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.GroupByType$GroupByCube";
}

export interface GroupByRollUp extends GroupByType {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.GroupByType$GroupByRollUp";
}

export interface HavingClause {
    loc: Location;
    expr: WhereExpr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.HavingClause";
}

export interface LimitClause {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface LimitExpr extends LimitClause {
    loc: Location;
    expr: ColonExpr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.LimitClause$LimitExpr";
}

export interface LimitValue extends LimitClause {
    loc: Location;
    i: number;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.LimitClause$LimitValue";
}

export interface NumberClause {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface NumberExpr extends NumberClause {
    expr: ColonExpr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.NumberClause$NumberExpr";
}

export interface NumberLiteral extends NumberClause {
    number: number;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.NumberClause$NumberLiteral";
}

export interface OffsetClause {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface OffsetExpr extends OffsetClause {
    loc: Location;
    expr: ColonExpr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.OffsetClause$OffsetExpr";
}

export interface OffsetValue extends OffsetClause {
    loc: Location;
    i: number;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.OffsetClause$OffsetValue";
}

export interface Order {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface OrderAsc extends Order {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.Order$OrderAsc";
}

export interface OrderDesc extends Order {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.Order$OrderDesc";
}

export interface OrderByClause {
    loc: Location;
    exprs: OrderByExpr[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.OrderByClause";
}

export interface OrderByExpr {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface OrderByDistance extends OrderByExpr {
    distance: DistanceFunctionExpr;
    order: Order;
    nullOrder: OrderNull;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.OrderByExpr$OrderByDistance";
}

export interface OrderByValue extends OrderByExpr {
    field: Field;
    order: Order;
    nullOrder: OrderNull;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.OrderByExpr$OrderByValue";
}

export interface OrderNull {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface OrderNullFirst extends OrderNull {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.OrderNull$OrderNullFirst";
}

export interface OrderNullLast extends OrderNull {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.OrderNull$OrderNullLast";
}

export interface Query {
    select: SelectClause;
    from: FromClause;
    where?: WhereClause;
    with?: WithClause;
    withIdentifiers: WithIdentifierClause[];
    groupBy?: GroupByClause;
    orderBy?: OrderByClause;
    limit?: LimitClause;
    offset?: OffsetClause;
    bind?: BindClause;
    tracking?: TrackingType;
    updateStats?: UpdateStatsClause;
    options?: QueryOption;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.Query";
}

export interface QueryExpr {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface ApexExpr extends QueryExpr {
    expr: ColonExpr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryExpr$ApexExpr";
}

export interface QueryExprLiteralExpr extends QueryExpr {
    literal: QueryLiteral;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryExpr$LiteralExpr";
}

export interface QueryLiteral {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface QueryDate extends QueryLiteral {
    loc: Location;
    literal: Date;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryLiteral$QueryDate";
}

export interface QueryDateFormula extends QueryLiteral {
    loc: Location;
    dateFormula: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryLiteral$QueryDateFormula";
}

export interface QueryDateTime extends QueryLiteral {
    loc: Location;
    literal: Date;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryLiteral$QueryDateTime";
}

export interface QueryFalse extends QueryLiteral {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryLiteral$QueryFalse";
}

export interface QueryMultiCurrency extends QueryLiteral {
    loc: Location;
    literal: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryLiteral$QueryMultiCurrency";
}

export interface QueryNull extends QueryLiteral {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryLiteral$QueryNull";
}

export interface QueryNumber extends QueryLiteral {
    loc: Location;
    literal: number;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryLiteral$QueryNumber";
}

export interface QueryString extends QueryLiteral {
    loc: Location;
    literal: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryLiteral$QueryString";
}

export interface QueryTime extends QueryLiteral {
    loc: Location;
    literal: Date;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryLiteral$QueryTime";
}

export interface QueryTrue extends QueryLiteral {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryLiteral$QueryTrue";
}

export interface QueryOp {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface QueryDoubleEqual extends QueryOp {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryOp$QueryDoubleEqual";
}

export interface QueryEqual extends QueryOp {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryOp$QueryEqual";
}

export interface QueryExcludes extends QueryOp {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryOp$QueryExcludes";
}

export interface QueryGreaterThan extends QueryOp {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryOp$QueryGreaterThan";
}

export interface QueryGreaterThanEqual extends QueryOp {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryOp$QueryGreaterThanEqual";
}

export interface QueryIn extends QueryOp {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryOp$QueryIn";
}

export interface QueryIncludes extends QueryOp {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryOp$QueryIncludes";
}

export interface QueryLessThan extends QueryOp {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryOp$QueryLessThan";
}

export interface QueryLessThanEqual extends QueryOp {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryOp$QueryLessThanEqual";
}

export interface QueryLike extends QueryOp {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryOp$QueryLike";
}

export interface QueryNotEqual extends QueryOp {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryOp$QueryNotEqual";
}

export interface QueryNotIn extends QueryOp {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryOp$QueryNotIn";
}

export interface QueryNotTripleEqual extends QueryOp {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryOp$QueryNotTripleEqual";
}

export interface QueryTripleEqual extends QueryOp {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryOp$QueryTripleEqual";
}

export interface QueryOption {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface IncludeDeleted extends QueryOption {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryOption$IncludeDeleted";
}

export interface LockRows extends QueryOption {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryOption$LockRows";
}

export interface QueryUsingClause {
    loc: Location;
    exprs: UsingExpr[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.QueryUsingClause";
}

export interface SelectClause {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface SelectColumnClause extends SelectClause {
    loc: Location;
    exprs: SelectExpr[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.SelectClause$SelectColumnClause";
}

export interface SelectCountClause extends SelectClause {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.SelectClause$SelectCountClause";
}

export interface SelectExpr {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface SelectCaseExpr extends SelectExpr {
    expr: CaseExpr;
    alias?: Identifier;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.SelectExpr$SelectCaseExpr";
}

export interface SelectColumnExpr extends SelectExpr {
    field: Field;
    alias?: Identifier;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.SelectExpr$SelectColumnExpr";
}

export interface SelectDistanceExpr extends SelectExpr {
    expr: DistanceFunctionExpr;
    alias?: Identifier;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.SelectExpr$SelectDistanceExpr";
}

export interface SelectInnerQuery extends SelectExpr {
    query: Query;
    alias?: Identifier;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.SelectExpr$SelectInnerQuery";
}

export interface TrackingType {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface ForReference extends TrackingType {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.TrackingType$ForReference";
}

export interface ForView extends TrackingType {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.TrackingType$ForView";
}

export interface UpdateStatsClause {
    loc: Location;
    options: UpdateStatsOption[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.UpdateStatsClause";
}

export interface UpdateStatsOption {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface UpdateTracking extends UpdateStatsOption {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.UpdateStatsOption$UpdateTracking";
}

export interface UpdateViewStat extends UpdateStatsOption {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.UpdateStatsOption$UpdateViewStat";
}

export interface UsingExpr {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface Using extends UsingExpr {
    name: Identifier;
    field: Identifier;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.UsingExpr$Using";
}

export interface UsingEquals extends UsingExpr {
    name: Identifier;
    field: Identifier;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.UsingExpr$UsingEquals";
}

export interface UsingId extends UsingExpr {
    name: Identifier;
    id: Identifier;
    field: Identifier;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.UsingExpr$UsingId";
}

export interface WhenExpr {
    loc: Location;
    op: WhenOp;
    identifiers: FieldIdentifier[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.WhenExpr";
}

export interface WhenOp {
    identifier: Identifier;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.WhenOp";
}

export interface WhereCalcOp {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface WhereCalcMinus extends WhereCalcOp {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.WhereCalcOp$WhereCalcMinus";
}

export interface WhereCalcPlus extends WhereCalcOp {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.WhereCalcOp$WhereCalcPlus";
}

export interface WhereClause {
    loc: Location;
    expr: WhereExpr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.WhereClause";
}

export interface WhereCompoundOp {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface QueryAnd extends WhereCompoundOp {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.WhereCompoundOp$QueryAnd";
}

export interface QueryOr extends WhereCompoundOp {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.WhereCompoundOp$QueryOr";
}

export interface WhereExpr {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface WhereCalcExpr extends WhereExpr {
    field1: FieldIdentifier;
    calc: WhereCalcOp;
    field2: FieldIdentifier;
    op: QueryOp;
    expr: QueryExpr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.WhereExpr$WhereCalcExpr";
}

export interface WhereCompoundExpr extends WhereExpr {
    op: WhereCompoundOp;
    expr: WhereExpr[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.WhereExpr$WhereCompoundExpr";
}

export interface WhereDistanceExpr extends WhereExpr {
    distance: DistanceFunctionExpr;
    op: QueryOp;
    expr: QueryExpr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.WhereExpr$WhereDistanceExpr";
}

export interface WhereInnerExpr extends WhereExpr {
    field: Field;
    op: QueryOp;
    inner: Query;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.WhereExpr$WhereInnerExpr";
}

export interface WhereOpExpr extends WhereExpr {
    field: Field;
    op: QueryOp;
    expr: QueryExpr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.WhereExpr$WhereOpExpr";
}

export interface WhereOpExprs extends WhereExpr {
    field: Field;
    op: QueryOp;
    expr: QueryExpr[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.WhereExpr$WhereOpExprs";
}

export interface WhereUnaryExpr extends WhereExpr {
    op: WhereUnaryOp;
    expr: WhereExpr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.WhereExpr$WhereUnaryExpr";
}

export interface WhereUnaryOp {
    loc: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.WhereUnaryOp";
}

export interface WithClause {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface WithDataCategories extends WithClause {
    loc: Location;
    categories: DataCategory[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.WithClause$WithDataCategories";
}

export interface WithValue extends WithClause {
    loc: Location;
    name: FieldIdentifier;
    expr: QueryExpr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.WithClause$WithValue";
}

export interface WithIdentifierClause {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface WithIdentifier extends WithIdentifierClause {
    identifier: Identifier;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.WithIdentifierClause$WithIdentifier";
}

export interface WithIdentifierTuple extends WithIdentifierClause {
    identifier: Identifier;
    keyValues: WithKeyValue[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.WithIdentifierClause$WithIdentifierTuple";
}

export interface WithKeyValue {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface BooleanKeyValue extends WithKeyValue {
    identifier: Identifier;
    value: boolean;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.WithKeyValue$BooleanKeyValue";
}

export interface NumberKeyValue extends WithKeyValue {
    identifier: Identifier;
    value: number;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.WithKeyValue$NumberKeyValue";
}

export interface StringKeyValue extends WithKeyValue {
    identifier: Identifier;
    value: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.soql.WithKeyValue$StringKeyValue";
}

export interface DivisionValue {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface DivisionExpr extends DivisionValue {
    expr: ColonExpr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.sosl.DivisionValue$DivisionExpr";
}

export interface DivisionLiteral extends DivisionValue {
    loc: Location;
    literal: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.sosl.DivisionValue$DivisionLiteral";
}

export interface FindClause {
    loc: Location;
    search: FindValue;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.sosl.FindClause";
}

export interface FindValue {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface FindExpr extends FindValue {
    expr: ColonExpr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.sosl.FindValue$FindExpr";
}

export interface FindString extends FindValue {
    value: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.sosl.FindValue$FindString";
}

export interface InClause {
    loc: Location;
    scope: string;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.sosl.InClause";
}

export interface ReturningClause {
    loc: Location;
    exprs: ReturningExpr[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.sosl.ReturningClause";
}

export interface ReturningExpr {
    name: Identifier;
    select?: ReturningSelectExpr;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.sosl.ReturningExpr";
}

export interface ReturningSelectExpr {
    loc: Location;
    fields: Field[];
    using?: QueryUsingClause;
    where?: WhereClause;
    orderBy?: OrderByClause;
    limit?: LimitClause;
    offset?: OffsetClause;
    bind?: BindClause;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.sosl.ReturningSelectExpr";
}

export interface Search {
    find: FindClause;
    in?: InClause;
    returning?: ReturningClause;
    division?: WithDivisionClause;
    dataCategory?: WithDataCategoryClause;
    withs: SearchWithClause[];
    using?: SearchUsingClause;
    limit?: LimitClause;
    updateStats?: UpdateStatsClause;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.sosl.Search";
}

export interface SearchUsingClause {
    loc: Location;
    type: UsingType;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.sosl.SearchUsingClause";
}

export interface SearchWithClause {
    name: Identifier;
    value?: SearchWithClauseValue;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.sosl.SearchWithClause";
}

export interface SearchWithClauseValue {
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface SearchWithFalseValue extends SearchWithClauseValue {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.sosl.SearchWithClauseValue$SearchWithFalseValue";
}

export interface SearchWithStringValue extends SearchWithClauseValue {
    values: string[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.sosl.SearchWithClauseValue$SearchWithStringValue";
}

export interface SearchWithTargetValue extends SearchWithClauseValue {
    target: Identifier;
    value: number;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.sosl.SearchWithClauseValue$SearchWithTargetValue";
}

export interface SearchWithTrueValue extends SearchWithClauseValue {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.sosl.SearchWithClauseValue$SearchWithTrueValue";
}

export interface SoslValues {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.sosl.SoslValues";
}

export interface UsingType {
    filter: Identifier;
    value: Identifier;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.sosl.UsingType";
}

export interface WithDataCategoryClause {
    loc: Location;
    categories: DataCategory[];
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.sosl.WithDataCategoryClause";
}

export interface WithDivisionClause {
    loc: Location;
    value: DivisionValue;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.data.sosl.WithDivisionClause";
}

export interface HiddenToken {
    value: string;
    location: Location;
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface HiddenTokenDecorator extends TokenSourceDecorator {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.parser.impl.HiddenTokenDecorator";
}

export interface HiddenTokens {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.parser.impl.HiddenTokens";
}

export interface BlockComment extends HiddenToken {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.parser.impl.HiddenTokens$BlockComment";
}

export interface InlineComment extends HiddenToken {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.parser.impl.HiddenTokens$InlineComment";
}

export interface InternalException extends CompilationException {
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.services.exception.InternalException";
}

export interface ParseException extends CompilationException {
    userError: UserError;
    "@id"?: string;
    "@reference"?: string;
    "@class": "apex.jorje.services.exception.ParseException";
}

export interface TokenSourceDecorator extends TokenSource {
    hiddenTokenMap: { [index: string]: HiddenToken };
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface Throwable extends Serializable {
    cause: Throwable;
    stackTrace: StackTraceElement[];
    message: string;
    suppressed: Throwable[];
    localizedMessage: string;
    "@id"?: string;
    "@reference"?: string;
}

export interface StackTraceElement extends Serializable {
    classLoaderName: string;
    moduleName: string;
    moduleVersion: string;
    methodName: string;
    fileName: string;
    lineNumber: number;
    className: string;
    nativeMethod: boolean;
    "@id"?: string;
    "@reference"?: string;
}

export interface CompilationException extends RuntimeException, Locatable {
    error: string;
    "@id"?: string;
    "@reference"?: string;
    "@class"?: string;
}

export interface TokenSource {
    sourceName: string;
    "@id"?: string;
    "@reference"?: string;
}

export interface Serializable {
    "@id"?: string;
    "@reference"?: string;
}

export interface RuntimeException extends Exception {
    "@id"?: string;
    "@reference"?: string;
}

export interface Exception extends Throwable {
    "@id"?: string;
    "@reference"?: string;
}

export type AssignmentOp = "EQUALS" | "AND_EQUALS" | "OR_EQUALS" | "XOR_EQUALS" | "ADDITION_EQUALS" | "SUBTRACTION_EQUALS" | "MULTIPLICATION_EQUALS" | "DIVISION_EQUALS" | "LEFT_SHIFT_EQUALS" | "RIGHT_SHIFT_EQUALS" | "UNSIGNED_RIGHT_SHIFT_EQUALS";

export type BinaryOp = "ADDITION" | "SUBTRACTION" | "MULTIPLICATION" | "DIVISION" | "LEFT_SHIFT" | "RIGHT_SHIFT" | "UNSIGNED_RIGHT_SHIFT" | "XOR" | "AND" | "OR";

export type BooleanOp = "DOUBLE_EQUAL" | "TRIPLE_EQUAL" | "NOT_TRIPLE_EQUAL" | "NOT_EQUAL" | "ALT_NOT_EQUAL" | "LESS_THAN" | "GREATER_THAN" | "LESS_THAN_EQUAL" | "GREATER_THAN_EQUAL" | "AND" | "OR";

export type LiteralType = "STRING" | "INTEGER" | "LONG" | "DOUBLE" | "DECIMAL" | "TRUE" | "FALSE" | "NULL";

export type PostfixOp = "INC" | "DEC";

export type PrefixOp = "POSITIVE" | "NEGATIVE" | "NOT" | "BITWISE_COMPLEMENT" | "INC" | "DEC";

export type TriggerUsage = "AFTER_DELETE" | "AFTER_INSERT" | "AFTER_UNDELETE" | "AFTER_UPDATE" | "BEFORE_DELETE" | "BEFORE_INSERT" | "BEFORE_UNDELETE" | "BEFORE_UPDATE";
