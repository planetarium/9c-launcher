import { INineChroniclesMixpanel } from "src/main/mixpanel";

export class MockedNineChroniclesMixpanel implements INineChroniclesMixpanel {
    track(eventName: string, properties?: object, callback?: () => void): void {
        console.log(`track: ${eventName}, properties: ${JSON.stringify(properties)}`);
    }
    alias(alias: string): void {
        console.log(`alias: ${alias}`);
    }
    login(): void {
        console.log("login");
    }
    miningConfig(): void {
        console.log("mining start");
    }
  
}
