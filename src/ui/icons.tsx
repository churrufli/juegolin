import Svg, { Circle, Ellipse, Path, Rect, Text as SvgText } from 'react-native-svg';

/** Iconos de trazo propios (24×24), dibujados como la tinta de las ilustraciones. Sin fuentes de iconos. */
export type IconName =
  | 'book'
  | 'timer'
  | 'seal'
  | 'sliders'
  | 'search'
  | 'dice'
  | 'back'
  | 'close'
  | 'bookmark'
  | 'bookmark-filled'
  | 'filter'
  | 'sun'
  | 'house'
  | 'hand'
  | 'clock'
  | 'leaf'
  | 'car'
  | 'cake'
  | 'people'
  | 'plus'
  | 'minus'
  | 'check'
  | 'shuffle'
  | 'play'
  | 'pause'
  | 'reset'
  | 'warning'
  | 'chevron'
  | 'trash'
  | 'moon'
  | 'spark'
  | 'chalk'
  | 'ten'
  | 'flag'
  | 'next'
  | 'user-plus'
  | 'adult'
  | 'age3'
  | 'age6'
  | 'age9'
  | 'family'
  | 'compress'
  | 'expand'
  | 'run'
  | 'walk'
  | 'weight'
  | 'target'
  | 'balance'
  | 'pencil'
  | 'box'
  | 'music'
  | 'hoop'
  | 'balloon'
  | 'chair'
  | 'marbles'
  | 'elastic'
  | 'top'
  | 'pin'
  | 'coin'
  | 'rope'
  | 'ball'
  | 'scarf'
  | 'cap'
  | 'sack'
  | 'can'
  | 'stone'
  | 'beanbag'
  | 'flashlight'
  | 'ribbon'
  | 'stick'
  | 'cards'
  | 'notebook'
  | 'whistle'
  | 'map'
  | 'compass'
  | 'vest'
  | 'pair'
  | 'crowd'
  | 'scatter'
  | 'versus'
  | 'one'
  | 'heart'
  | 'bolt'
  | 'hourglass'
  | 'quiet'
  | 'loud'
  | 'speaker'
  | 'bars1'
  | 'bars2'
  | 'bars3'
  | 'bulb'
  | 'palette'
  | 'juggle'
  | 'eye'
  | 'globe'
  | 'tent'
  | 'snow'
  | 'calendar'
  | 'star';

function glyph(name: IconName, color: string) {
  const s = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  switch (name) {
    case 'book':
      return (
        <>
          <Path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5v13c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z" {...s} />
          <Path d="M12 6v13.5" {...s} />
        </>
      );
    case 'timer':
      return (
        <>
          <Circle cx={12} cy={13} r={7} {...s} />
          <Path d="M12 9.5V13l2.5 1.5M10 3h4" {...s} />
        </>
      );
    case 'seal':
      return (
        <>
          <Circle cx={12} cy={10} r={6} {...s} />
          <Path d="M9 15.5L8 21l4-2 4 2-1-5.5" {...s} />
        </>
      );
    case 'sliders':
      return (
        <>
          <Path d="M4 7h10M18 7h2M4 17h4M12 17h8" {...s} />
          <Circle cx={16} cy={7} r={2} {...s} />
          <Circle cx={10} cy={17} r={2} {...s} />
        </>
      );
    case 'filter':
      return (
        <>
          <Path d="M4 7h16M7 12h10M10 17h4" {...s} />
        </>
      );
    case 'search':
      return (
        <>
          <Circle cx={11} cy={11} r={6.5} {...s} />
          <Path d="M16 16l4 4" {...s} />
        </>
      );
    case 'dice':
      return (
        <>
          <Rect x={3.5} y={3.5} width={17} height={17} rx={4} {...s} />
          <Circle cx={8.5} cy={8.5} r={1.2} fill={color} />
          <Circle cx={12} cy={12} r={1.2} fill={color} />
          <Circle cx={15.5} cy={15.5} r={1.2} fill={color} />
        </>
      );
    case 'back':
      return <Path d="M15 5l-7 7 7 7" {...s} />;
    case 'chevron':
      return <Path d="M9 5l7 7-7 7" {...s} />;
    case 'next':
      return <Path d="M5 12h13M13 6l6 6-6 6" {...s} />;
    case 'close':
      return <Path d="M6 6l12 12M18 6L6 18" {...s} />;
    case 'bookmark':
      return <Path d="M7 3.5h10v17l-5-3.5-5 3.5z" {...s} />;
    case 'bookmark-filled':
      return <Path d="M7 3.5h10v17l-5-3.5-5 3.5z" {...s} fill={color} />;
    case 'sun':
      return (
        <>
          <Circle cx={12} cy={12} r={4} {...s} />
          <Path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" {...s} />
        </>
      );
    case 'house':
      return <Path d="M4 11l8-6.5 8 6.5M6 9.5V20h12V9.5M10 20v-5h4v5" {...s} />;
    case 'hand':
      return <Path d="M8 12V6.5a1.5 1.5 0 013 0V11m0-5.5a1.5 1.5 0 013 0V11m0-4a1.5 1.5 0 013 0v6.5c0 4-2.5 7-6.5 7S5 18 5 14.5V11a1.5 1.5 0 013 0" {...s} />;
    case 'clock':
      return (
        <>
          <Circle cx={12} cy={12} r={8.5} {...s} />
          <Path d="M12 7.5V12l3 2" {...s} />
        </>
      );
    case 'leaf':
      return <Path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14zM5 19l7-7" {...s} />;
    case 'car':
      return (
        <>
          <Path d="M3.5 16v-3.5l2-5h13l2 5V16h-17zM3.5 12.5h17" {...s} />
          <Circle cx={7.5} cy={16.5} r={1.8} {...s} />
          <Circle cx={16.5} cy={16.5} r={1.8} {...s} />
        </>
      );
    case 'cake':
      return <Path d="M4 20h16M5 20v-7h14v7M5 16c2 1.5 4.5 1.5 7 0s5-1.5 7 0M12 13V9.5M12 6.5c-1-1-1-2 0-3 1 1 1 2 0 3z" {...s} />;
    case 'people':
      return (
        <>
          <Circle cx={9} cy={8.5} r={3} {...s} />
          <Circle cx={16.5} cy={9.5} r={2.5} {...s} />
          <Path d="M3.5 19.5c.5-3.5 2.7-5.5 5.5-5.5s5 2 5.5 5.5M14.5 14.3c2.6-.6 5.2 1 6 4.7" {...s} />
        </>
      );
    case 'user-plus':
      return (
        <>
          <Circle cx={10} cy={8.5} r={3.5} {...s} />
          <Path d="M3.5 20c.6-4 3.2-6 6.5-6s4.4 1 5.4 2.5M18.5 13v6M15.5 16h6" {...s} />
        </>
      );
    case 'adult':
      return (
        <>
          <Circle cx={8} cy={6} r={2.5} {...s} />
          <Circle cx={16.5} cy={10} r={2} {...s} />
          <Path d="M8 9v11M5 13l3-3 3 3M16.5 12.5V20M14.5 15.5l2-2 2 2" {...s} />
        </>
      );
    case 'plus':
      return <Path d="M12 5v14M5 12h14" {...s} />;
    case 'minus':
      return <Path d="M5 12h14" {...s} />;
    case 'check':
      return <Path d="M5 12.5l4.5 4.5L19 7.5" {...s} />;
    case 'shuffle':
      return <Path d="M4 7h3.5c4 0 5 10 9 10H20M4 17h3.5c1.5 0 2.5-1.4 3.3-3.2M13.2 10.2C14 8.4 15 7 16.5 7H20M17.5 4.5L20 7l-2.5 2.5M17.5 14.5L20 17l-2.5 2.5" {...s} />;
    case 'play':
      return <Path d="M8 5.5v13l10-6.5z" {...s} />;
    case 'pause':
      return <Path d="M9 5.5v13M15 5.5v13" {...s} />;
    case 'reset':
      return <Path d="M5 12a7 7 0 107-7c-2.4 0-4.4 1.1-5.7 2.9M5.5 4v4h4" {...s} />;
    case 'warning':
      return <Path d="M12 3.5l9 16H3zM12 10v4.5M12 17.2v.3" {...s} />;
    case 'trash':
      return <Path d="M4.5 6.5h15M9.5 6.5V4.5h5v2M6.5 6.5l1 13h9l1-13M10 10.5v5.5M14 10.5v5.5" {...s} />;
    case 'moon':
      return <Path d="M16 4.5a8 8 0 103.5 11.5A7 7 0 0116 4.5z" {...s} />;
    case 'spark':
      return <Path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" {...s} />;
    case 'chalk':
      return <Path d="M4.5 18.5l10-10 3 3-10 10h-3zM14.5 8.5l2-2a2.1 2.1 0 013 3l-2 2" {...s} />;
    case 'ten':
      return <Path d="M5 8l2-1.5V17M11.5 9.5c0-1.7 1.1-3 2.75-3S17 7.8 17 9.5v4c0 1.7-1.1 3-2.75 3s-2.75-1.3-2.75-3z" {...s} />;
    case 'flag':
      return <Path d="M5.5 21V4M5.5 4.5c4-2 6 2 12.5 0v8.5c-6.5 2-8.5-2-12.5 0" {...s} />;
  }
  return extraGlyph(name, color, s);
}

/** Iconos de las opciones de filtro: mismo trazo que el resto. */
function extraGlyph(name: IconName, color: string, s: { stroke: string; strokeWidth: number; strokeLinecap: 'round'; strokeLinejoin: 'round'; fill: string }) {
  const num = (n: string) => (
    <>
      <Circle cx={12} cy={12} r={8.5} {...s} />
      <SvgText x={12} y={16.2} fontSize={12} fontWeight="bold" textAnchor="middle" fill={color}>
        {n}
      </SvgText>
    </>
  );
  switch (name) {
    case 'age3':
      return num('3');
    case 'age6':
      return num('6');
    case 'age9':
      return num('9');
    case 'family':
      return <Path d="M7 8.5a2 2 0 100-4 2 2 0 000 4zM17 8.5a2 2 0 100-4 2 2 0 000 4zM12 13a1.6 1.6 0 100-3.2 1.6 1.6 0 000 3.2zM3.5 20v-4.5A3.5 3.5 0 017 12h0M20.5 20v-4.5A3.5 3.5 0 0017 12M9.5 20v-2.5a2.5 2.5 0 015 0V20" {...s} />;
    case 'compress':
      return <Path d="M4 4l5 5M9 5v4H5M20 4l-5 5M15 5v4h4M4 20l5-5M5 15h4v4M20 20l-5-5M19 15h-4v4" {...s} />;
    case 'expand':
      return <Path d="M9 9L4 4M4 8V4h4M15 9l5-5M16 4h4v4M9 15l-5 5M4 16v4h4M15 15l5 5M20 16v4h-4" {...s} />;
    case 'run':
      return <Path d="M14.5 6a1.8 1.8 0 100-3.6 1.8 1.8 0 000 3.6zM6 12l3-3.5h4.5l-2 5 3 2.5-1 5M11.5 13.5L8 20H4.5M13.5 8.5l2.5 3h3.5" {...s} />;
    case 'walk':
      return <Path d="M12.5 5.5a1.7 1.7 0 100-3.4 1.7 1.7 0 000 3.4zM12 8l-1 6 3 3 1 4.5M11 14l-2.5 6.5M12 8.5l3.5 3M11.5 8.5L8 11v3" {...s} />;
    case 'weight':
      return <Path d="M7.5 12h9M4.5 8.5v7M7.5 7v10M16.5 7v10M19.5 8.5v7M2.5 12h2M19.5 12h2" {...s} />;
    case 'target':
      return (
        <>
          <Circle cx={12} cy={12} r={8.5} {...s} />
          <Circle cx={12} cy={12} r={5} {...s} />
          <Circle cx={12} cy={12} r={1.5} {...s} />
        </>
      );
    case 'balance':
      return <Path d="M12 5.5a1.7 1.7 0 100-3.4 1.7 1.7 0 000 3.4zM4 9.5h16M12 8v7.5M12 15.5l-2.5 6M12 15.5l4.5 1.5" {...s} />;
    case 'pencil':
      return <Path d="M5 19l1-4L16 5l3 3L9 18zM14 7l3 3M5 19l4-1" {...s} />;
    case 'box':
      return <Path d="M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8" {...s} />;
    case 'music':
      return <Path d="M9 18V6l10-2v12M9 18a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM19 16a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM9 10l10-2" {...s} />;
    case 'hoop':
      return (
        <>
          <Ellipse cx={12} cy={12} rx={9} ry={5} {...s} />
          <Ellipse cx={12} cy={12} rx={6.5} ry={3} {...s} />
        </>
      );
    case 'balloon':
      return <Path d="M12 15c3.3 0 5.5-3 5.5-6.5S15 3 12 3 6.5 5 6.5 8.5 8.7 15 12 15zM11 15l-.5 1.5h3L13 15M12 16.5c-1.5 2 1.5 3-.5 5" {...s} />;
    case 'chair':
      return <Path d="M7 3v10h10V3M7 13v8M17 13v8M7 17h10M7 7h10" {...s} />;
    case 'marbles':
      return (
        <>
          <Circle cx={8} cy={15} r={4} {...s} />
          <Circle cx={16.5} cy={14} r={3.2} {...s} />
          <Circle cx={12.5} cy={6.5} r={2.6} {...s} />
          <Path d="M6.5 13.5c.8-.8 2-1 3-.6" {...s} />
        </>
      );
    case 'elastic':
      return <Path d="M3 8h18M3 16h18M5 8l3 8M11 8l2 8M16 8l3 8" {...s} />;
    case 'top':
      return <Path d="M12 2.5v3M5 9.5c0-2 3-4 7-4s7 2 7 4l-7 11zM5 9.5h14" {...s} />;
    case 'pin':
      return <Path d="M10.5 3.5h3c.5 1.5.5 3-.5 4.5 2.5 2 3.5 5 3 8.5-.3 2.5-1.5 4-1.5 4h-5s-1.2-1.5-1.5-4C7.5 13 8.5 10 11 8c-1-1.5-1-3-.5-4.5zM9.5 11h5" {...s} />;
    case 'coin':
      return (
        <>
          <Ellipse cx={12} cy={12} rx={8} ry={8} {...s} />
          <Path d="M14.5 9c-.5-1-1.5-1.5-2.5-1.5-1.5 0-2.5.8-2.5 2 0 2.8 5 1.5 5 4.3 0 1.2-1 2-2.5 2-1 0-2-.5-2.5-1.5M12 6v1.5M12 16.5V18" {...s} />
        </>
      );
    case 'rope':
      return <Path d="M5 4v4M19 4v4M5 8c0 9 14 9 14 0M3.5 4h3M17.5 4h3" {...s} />;
    case 'ball':
      return (
        <>
          <Circle cx={12} cy={12} r={8.5} {...s} />
          <Path d="M3.5 12c3-1 6-4 6.5-8.3M20.5 12c-3 1-6 4-6.5 8.3M5.5 6.5c3 2.5 10 8.5 13 11" {...s} />
        </>
      );
    case 'scarf':
      return <Path d="M3.5 6h17L12 19.5zM8 6l4 6.5L16 6" {...s} />;
    case 'cap':
      return <Path d="M12 4l1.6 1.5 2.2-.4.7 2.1 2.1.7-.4 2.2L19.7 12l-1.5 1.6.4 2.2-2.1.7-.7 2.1-2.2-.4L12 20l-1.6-1.5-2.2.4-.7-2.1-2.1-.7.4-2.2L4.3 12l1.5-1.6-.4-2.2 2.1-.7.7-2.1 2.2.4zM12 15a3 3 0 100-6 3 3 0 000 6z" {...s} />;
    case 'sack':
      return <Path d="M9 3.5h6l-1.5 3c4 1.5 6 5 5.5 9-.4 3-3 5-7 5s-6.6-2-7-5c-.5-4 1.5-7.5 5.5-9zM10.5 6.5h3" {...s} />;
    case 'can':
      return (
        <>
          <Ellipse cx={12} cy={5.5} rx={5.5} ry={2} {...s} />
          <Path d="M6.5 5.5v13c0 1.1 2.5 2 5.5 2s5.5-.9 5.5-2v-13M6.5 10h11M6.5 14.5h11" {...s} />
        </>
      );
    case 'stone':
      return <Path d="M4 15c-.5-3 2-7 6-8s9 0 10 4-2 7-7 7.5S4.5 18 4 15zM9 11c1-.8 2.5-1 3.5-.6" {...s} />;
    case 'beanbag':
      return <Path d="M5 9c0-2 1.5-3 3.5-3h7C17.5 6 19 7 19 9v6c0 2-1.5 3-3.5 3h-7C6.5 18 5 17 5 15zM9 6v12M15 6v12" {...s} />;
    case 'flashlight':
      return <Path d="M9 21h6V11l2.5-4V4h-11v3L9 11zM6.5 7h11M12 13.5v2" {...s} />;
    case 'ribbon':
      return <Path d="M12 9c-2-4-7-5-7-1s5 3 7 1zM12 9c2-4 7-5 7-1s-5 3-7 1zM11 10l-3 10 2.5-1.5L12 21M13 10l3 10-2.5-1.5" {...s} />;
    case 'stick':
      return <Path d="M5 20L19 4M13 10.5l2.5.5M9 14.5l-1.5-1" {...s} />;
    case 'cards':
      return (
        <>
          <Rect x={3} y={6} width={11} height={15} rx={2} {...s} transform="rotate(-10 8.5 13.5)" />
          <Rect x={10} y={4} width={11} height={15} rx={2} {...s} />
        </>
      );
    case 'notebook':
      return <Path d="M6 3h12v18H6zM9 3v18M3.5 7H6M3.5 12H6M3.5 17H6M12 8h4M12 11.5h4" {...s} />;
    case 'whistle':
      return <Path d="M3 11h10l7-3v5l-4 1a6 6 0 11-12 0zM10 8V5" {...s} />;
    case 'map':
      return <Path d="M3.5 6l5.5-2.5 6 2.5 5.5-2.5v14.5L15 20.5 9 18l-5.5 2.5zM9 3.5V18M15 6v14.5" {...s} />;
    case 'compass':
      return (
        <>
          <Circle cx={12} cy={12} r={8.5} {...s} />
          <Path d="M15.5 8.5l-2 5-5 2 2-5z" {...s} />
        </>
      );
    case 'vest':
      return <Path d="M8 3L4.5 6v15H11V12L8 3zM16 3l3.5 3v15H13V12l3-9zM4.5 13h6.5M13 13h6.5M4.5 16.5h6.5M13 16.5h6.5" {...s} />;
    case 'pair':
      return <Path d="M8.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM15.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM4 20v-3.5A4 4 0 018 12.5h1A4 4 0 0113 16.5M11 16.5a4 4 0 014-4h1a4 4 0 014 4V20" {...s} />;
    case 'crowd':
      return <Path d="M6 8a2 2 0 100-4 2 2 0 000 4zM12 7a2 2 0 100-4 2 2 0 000 4zM18 8a2 2 0 100-4 2 2 0 000 4zM9 14a2 2 0 100-4 2 2 0 000 4zM15 14a2 2 0 100-4 2 2 0 000 4zM5 21v-2.5a4 4 0 018 0V21M11 21v-2.5a4 4 0 018 0V21" {...s} />;
    case 'scatter':
      return <Path d="M12 9.5v-6M12 3.5L10 5.5M12 3.5l2 2M14.5 12h6M20.5 12l-2-2M20.5 12l-2 2M12 14.5v6M12 20.5l-2-2M12 20.5l2-2M9.5 12h-6M3.5 12l2-2M3.5 12l2 2" {...s} />;
    case 'versus':
      return <Path d="M7 8a2.2 2.2 0 100-4.4A2.2 2.2 0 007 8zM17 8a2.2 2.2 0 100-4.4A2.2 2.2 0 0017 8zM3.5 15v-2.5A3.5 3.5 0 017 9a3.5 3.5 0 013.5 3.5V15M13.5 15v-2.5A3.5 3.5 0 0117 9a3.5 3.5 0 013.5 3.5V15M12 3v18" {...s} />;
    case 'one':
      return (
        <>
          <Circle cx={12} cy={12} r={2.5} {...s} />
          <Circle cx={12} cy={3.8} r={1.4} {...s} />
          <Circle cx={12} cy={20.2} r={1.4} {...s} />
          <Circle cx={3.8} cy={12} r={1.4} {...s} />
          <Circle cx={20.2} cy={12} r={1.4} {...s} />
          <Circle cx={6.2} cy={6.2} r={1.4} {...s} />
          <Circle cx={17.8} cy={17.8} r={1.4} {...s} />
        </>
      );
    case 'heart':
      return <Path d="M12 20s-8-5-8-10.5C4 7 6 5 8.3 5c1.6 0 2.9 1 3.7 2.3C12.8 6 14.1 5 15.7 5 18 5 20 7 20 9.5 20 15 12 20 12 20z" {...s} />;
    case 'bolt':
      return <Path d="M13.5 2.5L5 13.5h6l-1 8 8.5-11h-6z" {...s} />;
    case 'hourglass':
      return <Path d="M6 3h12M6 21h12M7.5 3c0 5 9 6 9 9s-9 4-9 9M16.5 3c0 5-9 6-9 9s9 4 9 9" {...s} />;
    case 'quiet':
      return <Path d="M4 9.5h3l4.5-4v13L7 14.5H4zM15.5 9.5l5 5M20.5 9.5l-5 5" {...s} />;
    case 'speaker':
      return <Path d="M4 9.5h3l4.5-4v13L7 14.5H4zM15 9a4 4 0 010 6" {...s} />;
    case 'loud':
      return <Path d="M3 9.5h3l4.5-4v13L6 14.5H3zM14 9a4 4 0 010 6M16.5 6.5a7.5 7.5 0 010 11M19 4a11 11 0 010 16" {...s} />;
    case 'bars1':
      return <Path d="M5 20v-5" {...s} />;
    case 'bars2':
      return <Path d="M5 20v-5M12 20v-9" {...s} />;
    case 'bars3':
      return <Path d="M5 20v-5M12 20v-9M19 20V5" {...s} />;
    case 'bulb':
      return <Path d="M9 17.5h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.5.4 1 1.3 1 2.1v1.5h5V16c0-.8.5-1.7 1-2.1A6 6 0 0012 3z" {...s} />;
    case 'palette':
      return <Path d="M12 3.5c-5 0-8.5 3.6-8.5 8 0 4.6 3.6 8.5 8 8.5 1.4 0 2-.8 2-1.7 0-1.3-1.2-1.8-1.2-3 0-1 .8-1.8 1.8-1.8h2.4c2.3 0 4-1.7 4-4 0-3.3-3.6-6-8.5-6zM8 11a1 1 0 100-2 1 1 0 000 2zM12 8a1 1 0 100-2 1 1 0 000 2zM16 10a1 1 0 100-2 1 1 0 000 2z" {...s} />;
    case 'juggle':
      return (
        <>
          <Circle cx={6} cy={8} r={2} {...s} />
          <Circle cx={12} cy={4.5} r={2} {...s} />
          <Circle cx={18} cy={8} r={2} {...s} />
          <Path d="M4 14c2 4 14 4 16 0M7 19l-2.5-3M17 19l2.5-3" {...s} />
        </>
      );
    case 'eye':
      return (
        <>
          <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" {...s} />
          <Circle cx={12} cy={12} r={3} {...s} />
        </>
      );
    case 'globe':
      return (
        <>
          <Circle cx={12} cy={12} r={8.5} {...s} />
          <Path d="M3.5 12h17M12 3.5c-3 3-3 14 0 17M12 3.5c3 3 3 14 0 17" {...s} />
        </>
      );
    case 'tent':
      return <Path d="M2.5 20h19M12 4L3.5 20M12 4l8.5 16M12 4v16M9.5 20l2.5-6 2.5 6M10.5 2.5L12 4l1.5-1.5" {...s} />;
    case 'snow':
      return <Path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M10 4.5l2 2 2-2M10 19.5l2-2 2 2M4.5 10l2.7-.7-.7-2.7M19.5 14l-2.7.7.7 2.7M4.5 14l2.7.7-.7 2.7M19.5 10l-2.7-.7.7-2.7" {...s} />;
    case 'star':
      return <Path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" {...s} />;
    case 'calendar':
      return <Path d="M4 6.5h16v14H4zM4 10.5h16M8.5 3.5v5M15.5 3.5v5M9 15h2v2H9z" {...s} />;
  }
  return null;
}

export function Icon({ name, size = 24, color }: { name: IconName; size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false} importantForAccessibility="no-hide-descendants">
      {glyph(name, color)}
    </Svg>
  );
}
