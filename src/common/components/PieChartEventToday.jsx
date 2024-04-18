import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
//import usePositionAttributes from '../common/attributes/usePositionAttributes';
//import { useEffectAsync } from '../reactHelper';

const LineChartAttributesToday = () => {

    const deviceId = useSelector((state) => state.devices.selectedId);
    const from =  dayjs().startOf('day');
    const to =  dayjs().endOf('day');

    //const positionAttributes = {name: attr};

    const [items, setItems] = useState({});
    //const [types, setTypes] = useState([attr]);
    //const [type, setType] = useState(attr);

    async function fetchData() {
        const response = await fetch(`/api/reports/events?deviceId=${deviceId}&from=${from.toISOString()}&to=${to.toISOString()}`, {
            headers: { Accept: 'application/json' },
        });
        if (response.ok) {
            setItems(await response.json());
        } else {
            throw Error(await response.text());
        }
    };

    useEffect(() => {
        fetchData();
    },[]);

    return (
        <ResponsiveContainer width="100%" height="90%">
            <PieChart width={800} height={400} >
                <Pie
                data={items}
                cx={120}
                cy={200}
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
               >
                </Pie>
            </PieChart>
         </ResponsiveContainer>
    );
}

export default LineChartAttributesToday;