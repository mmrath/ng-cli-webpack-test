export class DashboardUiPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('nw-root h1')).getText();
  }
}
