import {IPipelineConfig} from "../lib/IPipelineConfig";

export const PipelineConfig: IPipelineConfig = {
    sourceStage: {
        repositoryName: 'simple-webapp',
        branchName: 'main',
        owner: 'shashimal',
        codestarArn: 'arn:aws:codestar-connections:us-east-1:0000:connection/4fc878df-93f1-45ef-89c8-3279b53b6ba4'
    },
    buildStage: {
        buildCommand: 'npm run build',
        s3Bucket: 'ds-webapp',
        s3BucketRegion: 'us-east-1'
    },
    notification: {
        slackChannelConfigArn: 'arn:aws:chatbot::0000:chat-configuration/slack-channel/cicd-webapp'
    },
}
