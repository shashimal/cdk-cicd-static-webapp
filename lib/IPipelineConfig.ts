export interface IPipelineConfig {
    sourceStage: ISourceStage
    buildStage: IBuildStage
    notification: INotification
}

export interface ISourceStage {
    codestarArn: string;
    repositoryName: string;
    branchName: string
    owner: string
}

export interface IBuildStage {
    buildCommand: string
    s3Bucket: string
    s3BucketRegion: string
}

export interface INotification {
    slackChannelConfigArn: string
}
