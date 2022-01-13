import {Stack} from "aws-cdk-lib";
import {CodeStarConnectionsSourceAction} from "aws-cdk-lib/aws-codepipeline-actions";
import {Artifact} from "aws-cdk-lib/aws-codepipeline";
import {IPipelineConfig} from "../IPipelineConfig";

export class SourceStage {

    private config: IPipelineConfig;
    private stack: Stack;
    private readonly appName: string;
    private readonly sourceOutput: Artifact;

    constructor(stack: Stack, appName: string, config: IPipelineConfig) {
        this.stack = stack;
        this.appName = appName;
        this.config = config;
        this.sourceOutput = new Artifact('SourceArtifact');
    }

    public getGithubSourceAction = (): CodeStarConnectionsSourceAction => {
        const {owner, repositoryName, branchName,codestarArn} = this.config.sourceStage;

        return new CodeStarConnectionsSourceAction({
            actionName: "Github-Source-Action",
            connectionArn: codestarArn,
            output: this.sourceOutput,
            owner: owner,
            repo: repositoryName,
            branch: branchName
        });
    }

    public getSourceOutput = (): Artifact => {
        return this.sourceOutput;
    }
}