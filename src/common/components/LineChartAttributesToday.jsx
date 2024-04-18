import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
//import usePositionAttributes from '../common/attributes/usePositionAttributes';
//import { useEffectAsync } from '../reactHelper';

//export default class LineChartx extends PureComponent {
const LineChartAttributesToday = ( {attr , min, max, interpola = 'monotone', yaxistick = true} ) => {

    const deviceId = useSelector((state) => state.devices.selectedId);
    const from =  dayjs().startOf('day');
    const to =  dayjs().endOf('day');

    const positionAttributes = {name: attr};

    const [items, setItems] = useState({});
    const [types, setTypes] = useState([attr]);
    const [type, setType] = useState(attr);

    async function fetchData() {
        const response = await fetch(`/api/reports/route?deviceId=${deviceId}&from=${from.toISOString()}&to=${to.toISOString()}`,{
            headers: { Accept: 'application/json' },
         });
        if (response.ok) {
            const positions = await response.json();
            const keySet = new Set();
            const keyList = [];
            const formattedPositions = positions.map((position) => {
                const data = { ...position, ...position.attributes };
                const formatted = {};
                formatted.fixTime = dayjs(position.fixTime).valueOf();
                Object.keys(data).filter((key) => !['id', 'deviceId'].includes(key)).forEach((key) => {
                    const value = data[key];
                    if (typeof value === 'number') {
                        keySet.add(key);
                        //const definition = positionAttributes[key] || {};
                        formatted[key] = value;
                    }
                });
                return formatted;
            });
            Object.keys(positionAttributes).forEach((key) => {
                if (keySet.has(key)) {
                keyList.push(key);
                keySet.delete(key);
                }
            });
            setTypes([...keyList, ...keySet]);
            setItems(formattedPositions);
        } else {
            throw Error(await response.text());
        }
    };

    useEffect(() => {
        fetchData();
    },[]);

    const formatTime = (value, format) => {
        if (value) {
          const d = dayjs(value);
          switch (format) {
            case 'date':
              return d.format('YYYY-MM-DD');
            case 'time':
              return d.format('HH:mm');
            case 'minutes':
              return d.format('YYYY-MM-DD HH:mm');
            default:
              return d.format('HH:mm:ss');
          }
        }
        return '';
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
          return (
            <div className="custom-tooltip">
              <p className="label">{`${formatTime(label, 'time')} = ${payload[0].value.toFixed(2)}`}</p>
            </div>
          );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height="90%">
            <AreaChart
                width={500}
                height={300}
                data={items}
                margin={{
                    top: 5,
                    right: 10,
                    left: 5,
                    bottom: 5,
                }}
            >
                <defs>
                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <XAxis 
                    dataKey="fixTime"
                    tickFormatter={(value) => formatTime(value, 'time')}
                    domain={['dataMin', 'dataMax']}
                    />
                <YAxis 
                    type="number"
                    domain={[min, max]}
                    tick={yaxistick}
                    />
                <Tooltip 
                    content={<CustomTooltip />}
                />
                <Area type={interpola} dataKey={type} stroke="#3da58a" fillOpacity={1} fill="url(#colorPv)" dot={false} connectNulls={true}/>
            </AreaChart>
         </ResponsiveContainer>
    );
}

export default LineChartAttributesToday;