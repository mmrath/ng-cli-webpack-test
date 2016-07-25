import { DashboardUiPage } from './app.po';

describe('dashboard-ui App', function() {
  let page: DashboardUiPage;

  beforeEach(() => {
    page = new DashboardUiPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('nw works!');
  });
});
