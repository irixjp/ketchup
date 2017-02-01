import { loading } from 'components/loading';
import Theme from 'lib/theme';

type ThemePickerCallback = (theme: string, template: string) => void;

export default class ThemePickerComponent {
  callback: ThemePickerCallback;
  themes: Mithril.Property<Theme[]>;
  ready: Mithril.Property<boolean>;
  templates: Mithril.Property<string[]>;
  selectedTheme: Mithril.Property<string>;
  selectedTemplate: Mithril.Property<string>;

  constructor(theme: string, template: string, callback: ThemePickerCallback) {
    this.callback = callback;
    this.themes = m.prop([]);
    this.templates = m.prop([]);
    this.ready = m.prop(false);

    this.selectedTheme = m.prop(theme);
    this.selectedTemplate = m.prop(template);

    Theme.list()
      .then((themes) => {
        this.themes(themes);
        return this.selectTheme(theme, true);
      })
      .then(() => this.selectedTemplate(template))
      .then(() => this.ready(true))
      .catch(() => this.ready(true));
  }

  selectTheme(name: string, initial = false) {
    this.selectedTheme(name);
    return Theme.get(this.selectedTheme())
      .then((t) => {
        let templates = Object.keys(t.templates).sort();
        this.templates(templates);
        this.selectedTemplate(templates[0]);
        if (!initial) {
          this.callback(this.selectedTheme(), this.selectedTemplate());
        }
      });
  }

  selectTemplate(template: string) {
    this.selectedTemplate(template);
    this.callback(this.selectedTheme(), this.selectedTemplate());
  }

  static controller = ThemePickerComponent;
  static view(ctrl: ThemePickerComponent) {
    if (!ctrl.ready()) {
      return loading(true);
    }
    return m('.theme-picker', [
      m('.control', [
        m('.label', 'Theme'),
        m('select', {
          config: (el: HTMLSelectElement, isInitialized: boolean) => {
            if (!isInitialized) {
              el.value = ctrl.selectedTheme();
            }
          },
          onchange: (e: Event) => {
            let target = e.target as HTMLInputElement;
            ctrl.selectTheme(target.value);
          },
        },
          ctrl.themes().map((theme: Theme) => {
            return m('option', {
              value: theme.name,
            }, theme.name);
          })
        )
      ]),
      m('.control', [
        m('.label', 'Template'),
        m('select', {
          config: (el: HTMLSelectElement, isInitialized: boolean) => {
            if (!isInitialized) {
              el.value = ctrl.selectedTemplate();
            }
          },
          onchange: (e: Event) => {
            let target = e.target as HTMLInputElement;
            ctrl.selectTemplate(target.value);
          },
        },
          ctrl.templates().map((template: string) => {
            return m('option', {
              value: template,
              key: template,
            }, template);
          })
        )
      ]),
    ]);
  }
}