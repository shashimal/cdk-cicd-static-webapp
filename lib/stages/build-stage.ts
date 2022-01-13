import {Stack} from "aws-cdk-lib";
import {Artifact} from "aws-cdk-lib/aws-codepipeline";
import {CodeBuildAction} from "aws-cdk-lib/aws-codepipeline-actions";
import {BuildSpec, Cache, LinuxBuildImage, LocalCacheMode, PipelineProject} from "aws-cdk-lib/aws-codebuild";
import {IPipelineConfig} from "../IPipelineConfig";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";

export class BuildStage {

    private readonly stack: Stack;
    private readonly appName: string;
    private readonly buildOutput: Artifact;
    private config: IPipelineConfig;

    constructor(stack: Stack, appName: string, config: IPipelineConfig) {
        this.stack = stack;
        this.appName = appName;
        this.config = config;
        this.buildOutput = new Artifact();
    }

    public getCodeBuildAction = (sourceOutput: Artifact): CodeBuildAction => {
        return new CodeBuildAction({
            actionName: "Build-Action",
            input: sourceOutput,
            project: this.createCodeBuildProject(),
            outputs: [this.buildOutput]
        });
    }

    private createCodeBuildProject = (): PipelineProject => {
        const pipelineProject = new PipelineProject(this.stack, `${this.appName}-CodeBuildProject`, {
            projectName: `${this.appName}-Codebuild-Project`,
            environment: {
                buildImage: LinuxBuildImage.STANDARD_5_0,
                privileged: true,
            },
            buildSpec: BuildSpec.fromObject(this.getS3BuildSpec()),
            cache: Cache.local(LocalCacheMode.DOCKER_LAYER, LocalCacheMode.CUSTOM),
        });

        pipelineProject.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    's3:GetObject',
                    's3:GetObjectVersion',
                    's3:GetBucketVersioning',
                    's3:PutObject',
                    's3:PutObjectAcl'
                ],
                resources: ['*']
            })
        );

        return pipelineProject;
    }


    private getS3BuildSpec = () => {
        const {s3Bucket, s3BucketRegion, buildCommand} = this.config.buildStage;
        return {
            version: '0.2',
            phases: {
                install: {
                    'runtime-versions': {
                        nodejs: '12.x'
                    }
                },
                pre_build: {
                    commands: [
                        'echo Installing source NPM dependencies...',
                        'npm install'
                    ]
                },
                build: {
                    commands: ['echo Build started on `date`', `${buildCommand}`]
                },
                post_build: {
                    commands: [
                        'echo Copy the contents of /build to S3',
                        `aws s3 cp --recursive --acl public-read --region ${s3BucketRegion} ./build s3://${s3Bucket}/`,
                        'echo S3 deployment completed on `date`'
                    ]
                }
            },
            artifacts: {
                files: ['**/*'],
                'base-directory': 'build'
            }
        };
    };

}