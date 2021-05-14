export default interface Launch extends Object{
  id: string;
  url: string;
  slug?: string;
  name: string;
  status: {
    id: number;
    name: string;
    abbrev?: string;
    description?: string;
  };
  net: string;
  probability: number;
  rocket: {
    id: number;
    launcher_stage: Array<launcher_stage>;
  };
  pad: {
    id: number;
    name: string;
    wiki_url: string;
    location: {
      id: number;
      name: string;
    };
  };
  vidURLs: Array<vidUrl>;
}

interface launcher_stage {
  id: number;
  launcher: {
    serial_number: number;
  };
}

interface vidUrl {
  priority: number;
  url: string;
}
