import {Stack} from "aws-cdk-lib";
import {
    INotificationRuleSource,
    INotificationRuleTarget,
    NotificationRule
} from "aws-cdk-lib/aws-codestarnotifications";
import {IPipelineConfig} from "../IPipelineConfig";
import {SlackChannelConfiguration} from "aws-cdk-lib/aws-chatbot";

export class PipelineNotification {

    private readonly stack: Stack;
    private readonly appName: string

    constructor(stack: Stack, appName: string) {
        this.stack = stack;
        this.appName = appName;
    }

    public configureSlackNotifications = (source: INotificationRuleSource, config: IPipelineConfig) => {
        new NotificationRule(this.stack, `${this.appName}-slack-notifications`, {
            events: [
                'codepipeline-pipeline-stage-execution-succeeded',
                'codepipeline-pipeline-stage-execution-failed',
                'codepipeline-pipeline-pipeline-execution-failed',
            ],
            source,
            targets: this.getSlackChannelConfiguration(config)
        })
    };

    private getSlackChannelConfiguration = (config: IPipelineConfig): INotificationRuleTarget[] => {
        const targets: INotificationRuleTarget[] = []
        if (config && config.notification.slackChannelConfigArn) {
            const slack = SlackChannelConfiguration.fromSlackChannelConfigurationArn(this.stack,
                `${this.appName}--slack-channel-config`,
                config.notification.slackChannelConfigArn)
            targets.push(slack);
        }
        return targets;
    }
}