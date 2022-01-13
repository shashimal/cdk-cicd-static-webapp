import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Pipeline} from "aws-cdk-lib/aws-codepipeline";
import {PipelineConfig} from "../config/PipelineConfig";
import {SourceStage} from "./stages/source-stage";
import {BuildStage} from "./stages/build-stage";
import {PipelineNotification} from "./notification/PipelineNotification";

export class CdkCicdStaticWebappStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        const appName = this.node.tryGetContext('appName');
        const config = PipelineConfig;

        //CodePipeline object
        const codePipeline = new Pipeline(this, `${appName}-CodePipeline`, {
            crossAccountKeys: false
        });

        //Source stage
        const sourceStage = new SourceStage(this, appName, config);
        codePipeline.addStage({
            stageName: "Source-GitHub",
            actions: [sourceStage.getGithubSourceAction()]
        });

        //Build stage
        const buildStage = new BuildStage(this, appName, config);
        codePipeline.addStage({
            stageName: "Copy-to-S3",
            actions: [buildStage.getCodeBuildAction(sourceStage.getSourceOutput())]
        });

        //Configure notifications for the pipeline events
        const pipelineNotification = new PipelineNotification(this, appName);
        pipelineNotification.configureSlackNotifications(codePipeline, config);
    }
}
