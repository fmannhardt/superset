/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
/* eslint-disable theme-colors/no-literal-colors */
import { useEffect, createRef } from 'react';
import { styled } from '@superset-ui/core';
import * as d3 from 'd3';
import {
  SupersetPluginGanttChartProps,
  SupersetPluginGanttChartStylesProps,
  SupersetPluginGanttChartTagStylesProps,
} from './types';

// import * as d3Scale from "d3-scale";

// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled

// Theming variables are provided for your use via a ThemeProvider
// imported from @superset-ui/core. For variables available, please visit
// https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts

const Styles = styled.div<SupersetPluginGanttChartStylesProps>`
  // grid color
  .grid .tick {
    stroke: lightgrey;
    opacity: 0.5;
    shape-rendering: crispEdges;
  }
  .svg {
    padding-right: 20px;
  }
  .grid path {
    stroke-width: 0;
  }
  // *{
  //   overflow:scroll
  // }

  #tag {
    color: #000;
    background: #fff;
    width: 180px;
    position: absolute;
    display: none;
    padding: 3px 10px;
    margin-left: -80px;
    font-size: 9px;
    box-shadow: 0px 0px 5px #808080;
  }

  #tag:before {
    border: solid transparent;
    content: ' ';
    height: 0;
    left: 50%;
    margin-left: -5px;
    position: absolute;
    width: 0;
    border-width: 10px;
    border-bottom-color: #fff;
    top: -20px;
  }
`;

/**
 * ******************* WHAT YOU CAN BUILD HERE *******************
 *  In essence, a chart is given a few key ingredients to work with:
 *  * Data: provided via `props.data`
 *  * A DOM element
 *  * FormData (your controls!) provided as props by transformProps.ts
 */

export default function SupersetPluginGanttChart(
  props: SupersetPluginGanttChartProps,
) {
  // height and width are the height and width of the DOM element as it exists in the dashboard.
  // There is also a `data` prop, which is, of course, your DATA 🎉
  const { data, width } = props;
  // console.log('data', data);
  const TagStyles = styled.div<SupersetPluginGanttChartTagStylesProps>`
    #tag-${data.length} {
      color: #000;
      background: #fff;
      width: 180px;
      position: absolute;
      display: none;
      padding: 3px 10px;
      margin-left: -80px;
      font-size: 9px;
      box-shadow: 0px 0px 5px #808080;
    }

    #tag-${data.length}:before {
      border: solid transparent;
      content: ' ';
      height: 0;
      left: 50%;
      margin-left: -5px;
      position: absolute;
      width: 0;
      border-width: 10px;
      border-bottom-color: #fff;
      top: -20px;
    }
  `;
  // let tempheight = props && (props.height * 35) / 100;
  // console.log("org", props.height);
  // console.log("temp", tempheight);

  // const height = data.length * 32;
  const groupData = (tasks: any) => {
    const uniqueCategories: any = Array.from(
      new Set(tasks.map((d: any) => d.from)),
    );
    const groupedData: any = [];
    const Labels: any = [];
    const Array_vert: any = [];
    uniqueCategories.forEach((element: any) => {
      const sortedEle = tasks
        .filter((d: any) => d.from === element)
        .sort((a: any, b: any) => (b.starttime > a.starttime ? -1 : 1));
      let prev: any;
      const children: any = [];
      const modified_data = lineIndexing(sortedEle);
      // console.log("srtele",sortedEleInd);
      const { array_vert } = modified_data;
      const Labels_array = modified_data.labels_array;
      const sortedEleInd = modified_data.sortedElement;

      array_vert.forEach((array: any) => {
        Array_vert.push(array);
      });

      Labels_array.forEach((label: any) => {
        Labels.push(label);
      });

      sortedEleInd.forEach((d: any, index: number) => {
        if (prev && prev.from === d.from && overlapCheck(prev, d)) {
          children.push({ ...d, status: 'inline' });
        } else if (children.length === 0) {
          children.push({ ...d, status: 'inline' });
        } else {
          children.push({ ...d, status: 'overlap' });
        }
        prev = d;
      });
      groupedData.push({
        task: element,
        childs: children,
      });
    });
    return {
      groups: groupedData,
      uniqueCategories,
      Labels_array: Labels,
      Array_vert,
    };
  };

  const filteredData = data;
  const taskArray = filteredData.sort((a: any, b: any) =>
    b.from > a.from ? -1 : 1,
  );
  const uniqueData = groupData(taskArray);
  const data_length = uniqueData.Labels_array.length;
  const height = data_length <= 30 ? data_length * 31 : data_length * 29;

  // console.log('height', data_length);

  // console.log("cal",height)
  // console.log('DATA', data);
  const rootElem = createRef<HTMLDivElement>();
  const divElement: any = document.getElementById('scroll-div');

  let minNum = 0;
  let maxNum = 0;
  const createChart = (divEle: any) => {
    // const element = document.getElementById("graphic");
    const svg = d3
      .select(`#graphic-${data.length}`)
      .append('svg')
      .attr('width', width + 250)
      .attr('height', height + 80)
      .attr('class', 'svg');
    // .filter((d: any)=> d.starttime !== d.endtime );
    // console.log('data', filteredData);

    // console.log("taskArray", taskArray);
    const min: any = d3.min(taskArray, (d: any) => d.starttime);
    const max: any = d3.max(taskArray, (d: any) => d.endtime);
    minNum = min;
    maxNum = max;
    const timeScale: any = d3
      .scaleLinear()
      .domain([min, max])
      .range([0, width - 150]); // horizontal rectangle last tick right padding

    let categories = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < taskArray.length; i++) {
      categories.push(taskArray[i].from);
    }
    const catsUnfiltered = categories; // for vert labels
    categories = checkUnique(categories);

    // X axis label
    svg
      .append('text')
      .text('Time since case started (minutes)')
      .attr('x', width / 2)
      .attr('y', height + 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', 9)
      // .attr("transform", "rotate(-65)")
      .attr('fill', '#000000');

    // axis label
    svg
      .append('text')
      .text('Assembly Step')
      .attr('x', 0)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', 9)
      .attr('transform', `rotate(-90-5 ${height / 2 - 15})`)
      .attr('fill', '#000000');

    makeGant(
      taskArray,
      width,
      height,
      categories,
      timeScale,
      svg,
      catsUnfiltered,
      filteredData,
    );
  };

  const makeGant = (
    tasks: any,
    pageWidth: any,
    pageHeight: any,
    categories: any,
    timeScale: any,
    svg: any,
    catsUnfiltered: any,
    filteredData: any,
  ) => {
    // console.log("makeGant");

    const barHeight = 25;
    const gap = barHeight + 2;
    const topPadding = 75;
    const sidePadding = 140; // grid left side padding of ticks rendering

    const colorScale = d3.scaleLinear().domain([0, categories.length]);

    makeGrid(sidePadding, topPadding, pageWidth, pageHeight, timeScale, svg);
    drawRects(
      tasks,
      gap,
      topPadding,
      sidePadding,
      barHeight,
      colorScale,
      pageWidth,
      pageHeight,
      svg,
      categories,
      timeScale,
      filteredData,
    );
    vertLabels(gap, topPadding, svg, filteredData);
  };
  const makeGrid = (
    theSidePad: any,
    theTopPad: any,
    w: any,
    h: any,
    timeScale: any,
    svg: any,
  ) => {
    // console.log("makeGrid");
    // verticle ticks
    const total = minNum + maxNum;
    // console.log('total', total);
    let ticks = 1;
    if (total > 0 && total < 25) {
      ticks = 1;
    } else if (total > 25 && total < 50) {
      ticks = 2;
    } else if (total > 50 && total < 90) {
      ticks = 4;
    } else if (total > 90 && total < 120) {
      ticks = 5;
    } else if (total > 120 && total < 150) {
      ticks = 6;
    } else if (total > 150 && total < 180) {
      ticks = 7;
    } else if (total > 180 && total < 210) {
      ticks = 8;
    } else {
      ticks = 10;
    }
    // Y axis ticks height
    const xAxis = d3
      .axisBottom(timeScale)
      .scale(timeScale)
      .ticks(ticks)
      .tickSize(-h + theTopPad + 20)
      .tickFormat((d: any, i: number) => {
        if (i % 2 === 0) {
          return d;
        }
        return '';
      });

    // const grid
    svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${theSidePad}, ${h - 18})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'middle')
      .attr('stroke', '#808080')
      .attr('stroke-width', '0.5px')
      .attr('font-size', 10)
      .attr('dy', '1em');
  };

  // Draw horizontal rectangles
  const eleWithIndex: any = [];
  const drawRects = (
    theArray: any,
    theGap: any,
    theTopPad: any,
    theSidePad: any,
    theBarHeight: any,
    theColorScale: any,
    w: any,
    h: any,
    svg: any,
    categories: any,
    timeScale: any,
    filteredData: any,
  ) => {
    // console.log('drawRects');
    const rectArray = [...theArray.filter((dt: any) => dt.endtime)];
    // console.log('rrr',rectArray);

    const groupedData = groupData(rectArray);
    // console.log('vvvv',groupedData.Labels_array.length);
    const uniqueCategories: any = Array.from(
      new Set(rectArray.map((d: any) => d.from)),
    );
    const noOfRects: any = [];
    uniqueCategories.forEach((cat: any) => {
      const check = checkInline(cat, rectArray);
      let total = 0;
      total = check.single + 1;
      // eslint-disable-next-line no-plusplus
      for (let index = 0; index < total; index++) {
        noOfRects.push(1);
      }
    });

    //  console.log("noofRects", noOfRects);

    let innerSortedArray: Array<any> = [];
    groupedData.groups.forEach((element: any) => {
      const sort = element.childs.sort((a: any, b: any) =>
        b.starttime > a.starttime ? -1 : 1,
      );
      innerSortedArray = [...innerSortedArray, ...sort];
    });
    // console.log("innerSortedArray",innerSortedArray);

    // draw x axis rectangles
    svg
      .append('g')
      .selectAll('rect')
      .filter((d: any) => d.endtime)
      .data(groupedData.Labels_array)
      .enter()
      .append('rect')
      .attr('x', 140)
      .attr('y', (d: any, i: any) => i * theGap + theTopPad)
      .attr('width', (d: any) => '100%')
      .attr('height', (d: any) => theGap)
      .attr('stroke', '#808080')
      .attr('stroke-width', '0.5px')
      .attr('fill', '#fff')
      .attr('opacity', 0.2);

    const rectangles = svg
      .append('g')
      .selectAll('rect')
      .data(rectArray)
      .enter();

    // inner reactangle drawer

    let y = 0;
    let i = 0;

    const colors = ['#74c7e9', '#046a94', '#73dbd3', '#dbda73'];

    let desc = '';
    let y_prev: number;
    let ind = 0;

    const innerRects = rectangles
      .data(innerSortedArray.filter((dt: any) => dt.endtime !== null))
      .append('rect')
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('x', function (d: any) {
        if (timeScale(d.endtime) - timeScale(d.starttime) === 0) {
          return timeScale(d.starttime) + theSidePad - 20;
        }
        return timeScale(d.starttime) + theSidePad;
      })
      .attr('y', function (d: any) {
        if (d.from === desc && d.line === 1) {
          eleWithIndex.push({
            task: d,
            index: i,
          });

          desc = d.from;
          return y_prev;
        }
        if (d.from === desc && d.line !== 1) {
          ind = +1;
          eleWithIndex.push({
            task: d,
            index: i + d.line - 2,
          });

          // i++;

          desc = d.from;
          return y_prev + (d.line - 1) * theGap;
        }
        if (ind !== 0) {
          i = i + ind - 1;
          ind = 0;
        }
        eleWithIndex.push({
          task: d,
          index: i,
        });
        //  console.log("d",d);

        y = i * theGap + theTopPad;

        i = +1;

        desc = d.from;
        y_prev = y;

        return y;

        // }
      })
      .attr('width', function (d: any) {
        if (timeScale(d.endtime) - timeScale(d.starttime) === 0) {
          return 4;
        }
        return timeScale(d.endtime) - timeScale(d.starttime) - 2;
      })
      .attr('height', function (d: any) {
        if (timeScale(d.endtime) - timeScale(d.starttime) === 0) {
          return theBarHeight;
        }
        return theBarHeight;
      })
      .attr('stroke', 'none')
      .attr('fill', (d: any, index: number) =>
        d.starttime === d.endtime ? colors[1] : colors[0],
      );

    // console.log('ffff', filteredData);
    // mouse over popup on inner rectangles
    innerRects
      .on('mouseover', (e: any, index: any, array: any) => {
        // console.log('evnt', e);
        const eleIndex = eleWithIndex.filter((d: any) => d.task === e)[0].index;
        // console.log('eleIndex', eleIndex);
        const tag = `From:  ${e.from} <br/> To:  ${e.to} <br/> Start Time:  ${e.starttime} <br/> End Time:  ${e.endtime}`;
        const output: any = document.getElementById(`tag-${data?.length}`);
        const x = `${
          timeScale(e.starttime) + theSidePad - divElement?.scrollLeft - 10
        }px`;

        const y = `${eleIndex * theGap + theTopPad - divElement?.scrollTop + 25}px`;
        output.innerHTML = tag;
        // console.log('element', y, divElement?.scrollTop || 0, eleIndex);

        output.style.top = y;
        output.style.left = x;
        output.style.fontSize = '9px';
        output.style.display = 'block';
      })
      .on('mouseout', () => {
        const output: any = document.getElementById(`tag-${data?.length}`);
        output.style.display = 'none';
      });

    // inner rectangle text
    // console.log('rectangles', rectangles);
    // prevY = 0;
    y = 0;
    let textIndex: any = 0;
    // const innerText =
    // inner text color
    let desc_prev = '';
    let y_text_prev: number;
    let flag = 0;
    const innerText = rectangles
      // .append((d: any) => { return d.starttime !== d.endtime ? "text" : "react" })
      .append('text')
      .text((d: any) => {
        // console.log("length", d.to.length,)
        if (timeScale(d.endtime) - timeScale(d.starttime) === 0) {
          return '';
        }
        if (d.to.length >= timeScale(d.endtime) - timeScale(d.starttime)) {
          return '';
        }
        return d.to.length > 1
          ? d.to.length > 10
            ? d.to.substr(0, 5)
            : `${d.to.substr(0, 14)}...`
          : '';
      })
      .attr(
        'x',
        (d: any) =>
          (timeScale(d.endtime) - timeScale(d.starttime)) / 2 +
          timeScale(d.starttime) +
          theSidePad,
      )
      .attr('y', (d: any) => {
        if (d.endtime === null) {
          return 0;
        }

        if (d.from === desc_prev && d.line === 1) {
          desc_prev = d.from;
          return y_text_prev;
        }
        if (d.line !== 1) {
          flag = 1;
          desc_prev = d.from;
          textIndex = +1;
          return y_text_prev + ((d.line - 1) * theGap + theTopPad);
        }
        if (flag === 1) {
          textIndex = -1;
          flag = 0;
        }

        y = textIndex * theGap + theTopPad;

        textIndex = +1;

        desc_prev = d.from;
        y_text_prev = y;

        return y + 15;
      })
      .attr('font-size', 9)
      .attr('text-anchor', 'middle')
      .attr('text-height', theBarHeight)
      .attr('fill', '#000');

    innerText
      .on('mouseover', (e: any, index: any, array: any) => {
        const eleIndex = eleWithIndex.filter((d: any) => d.task === e)[0].index;
        const tag = `From:  ${e.from} <br/> To:  ${e.to} <br/> Start Time:  ${e.starttime} <br/> End Time:  ${e.endtime}`;
        const output: any = document.getElementById(`tag-${data?.length}`);
        const x = `${
          timeScale(e.starttime) + theSidePad - divElement?.scrollLeft - 10
        }px`;
        const y = `${eleIndex * theGap + theTopPad - divElement?.scrollTop + 25}px`;

        output.innerHTML = tag;
        output.style.top = y;
        output.style.left = x;
        //  console.log('element', y, divElement?.scrollTop, eleIndex);

        output.style.display = 'block';
      })
      .on('mouseout', () => {
        const output: any = document.getElementById(`tag-${data?.length}`);
        output.style.display = 'none';
      });
  };
  // X Axis label
  const vertLabels = (
    theGap: any,
    theTopPad: any,
    svg: any,
    filteredData: any,
  ) => {
    // let prev: any;
    let y = 0;
    // let y1: number = 0;
    let index = 0;
    // const categories: any = [];
    // console.log('theGap, theTopPad, svg', theGap, theTopPad, svg);
    // console.log("data", filteredData.filter((dt: any) => prev && dt.from === prev.from))

    // let prev_label = "";
    // let prev_y;

    const groupedData = groupData(filteredData.filter((dt: any) => dt.endtime));
    // console.log("dddd", groupedData.groups)
    // console.log("llll", groupedData.Array_vert)
    // draw left side labels
    const rowLabels = svg
      .append('g')
      .selectAll('text')
      .data(groupedData.Array_vert)
      .enter()
      .append('text')
      .attr('id', (d: any, i: number) => `ltext${i}`)
      .text((d: any, i: number) => d[0])
      .attr('x', 140)
      .attr('y', (d: any, i: any) => {
        if (d.length === 1) {
          y = index * theGap + theTopPad;
          index += 1;
          return y + 15;
        }
        const offset = d.length / 2 - 0.5;

        y = (index + offset) * theGap + theTopPad;
        index += d.length;
        return y + 15;
      })
      .attr('font-size', 9)
      .attr('width', '150px')
      .attr('class', 'label-left')
      .attr('text-anchor', 'end')
      .attr('text-height', 9);

    // divide left side lable in multiline
    rowLabels.each(function each(d: any, i: number) {
      const node = d3.select(`#ltext${i}`);
      const textFromNode = node.text();
      // console.log('textFromNode', textFromNode);
      const stringArray = stringToChanks(textFromNode, 25);
      const x: any = node.attr('x');
      const y: any = node.attr('y');
      const dy = parseFloat(node.attr('dy')) || 0;
      const lineHeight = 1.1; // ems
      node.text('').append('tspan');
      stringArray.forEach((element, i) => {
        node
          .append('tspan')
          .attr('x', x)
          .attr('y', stringArray.length > 1 ? y - 7 : y)
          .attr('dy', `${i * lineHeight + dy}em`)
          .text(stringArray[i]);
      });
    });
  };

  function stringToChanks(str: string, chunkSize: number) {
    const chunks = [];
    while (str.length > 0) {
      chunks.push(str.substring(0, chunkSize));
      // eslint-disable-next-line no-param-reassign
      str = str.substring(chunkSize, str.length);
    }
    return chunks;
  }

  const checkInline = (task: any, filteredData: any) => {
    const grouped: any = groupData(
      filteredData.filter((d: any) => d.endtime !== null),
    );
    const filter = grouped.groups.filter((d: any) => d.task === task);
    if (filter.length > 0) {
      return {
        total: filter[0].childs.length,
        inline: filter[0].childs.filter((d: any) => d.status === 'inline')
          .length,
        single: filter[0].childs.filter((d: any) => d.status === 'single')
          .length,
        items: filter[0].childs,
        task,
      };
    }
    return {
      total: 0,
      inline: 0,
      items: filter,
    };
  };

  const checkUnique = (arr: any) => {
    // console.log('checkUnique');
    const hash: any = {};
    const result: any = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0, l = arr.length; i < l; ++i) {
      if (!hash.hasOwnProperty(arr[i])) {
        hash[arr[i]] = true;
        result.push(arr[i]);
      }
    }
    return result;
  };

  function overlapCheck(previous: any, current: any) {
    const end_times = [];

    if (end_times.length === 0) {
      end_times.push(current.endtime);
    }
    if (
      current.starttime < previous.endtime &&
      current.endtime > previous.starttime
    ) {
      return false;
    }
    return true;
  }

  function lineIndexing(sortedEle: any) {
    // console.log("sre",sortedEle);

    const end_times: any = [];
    const labels_array: any = [];
    const array_vert: any = [];

    if (sortedEle.length === 1) {
      const sortedElement = [
        {
          ...sortedEle[0],
          line: 1,
        },
      ];

      const array = [];
      array.push(sortedEle[0].from);
      array_vert.push(array);
      labels_array.push(sortedEle[0].from);

      return {
        sortedElement,
        labels_array,
        array_vert,
      };
    }
    const label = sortedEle[0].from;
    let maxline = 0;
    sortedEle.forEach((d: any, ind: any) => {
      let flag = false;

      if (end_times.length) {
        let index = 1;
        // console.log(end_times);

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < end_times.length; i++) {
          if (d.starttime <= end_times[i]) {
            index = +1;
          } else {
            flag = true;
            end_times[i] = d.endtime;
            // eslint-disable-next-line no-param-reassign
            sortedEle[ind] = {
              ...d,
              line: index,
            };
          }
        }

        if (!flag) {
          end_times.push(d.endtime);
          // eslint-disable-next-line no-param-reassign
          sortedEle[ind] = {
            ...d,
            line: index,
          };
        }

        if (index > maxline) {
          maxline = index;
        }
      } else {
        end_times.push(d.endtime);
        // eslint-disable-next-line no-param-reassign
        sortedEle[ind] = {
          ...d,
          line: 1,
        };
      }
    });

    const array = [];

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < maxline; i++) {
      labels_array.push(label);
      array.push(label);
    }

    array_vert.push(array);

    return {
      sortedElement: sortedEle,
      labels_array,
      array_vert,
    };
  }

  useEffect(() => {
    d3.select(`#graphic-${data.length}`).selectAll('svg').remove();
    createChart(rootElem);
  });
  return (
    <div
      id="scroll-div"
      style={{
        height: `${props.height}px`,
        overflow: 'scroll',
      }}
    >
      <Styles
        ref={rootElem}
        boldText={props.boldText}
        headerFontSize={props.headerFontSize}
        height={height + 250}
        width={width + 100}
      >
        <div id={`graphic-${data?.length}`} />
        <TagStyles>
          <div id={`tag-${data?.length}`} />
        </TagStyles>
      </Styles>
    </div>
  );
}
