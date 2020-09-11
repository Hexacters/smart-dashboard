export abstract class ASettings {
    hideTab: boolean;
    title: string;
    fullScreen: boolean;
    toggle(): void {
        this.hideTab = !this.hideTab;
    }
    expand(): void {  }

    fullscreen(): void {
        this.fullScreen = !this.fullScreen;
    }
}
