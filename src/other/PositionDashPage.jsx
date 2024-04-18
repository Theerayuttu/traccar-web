import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Typography, Container, Paper, AppBar, Toolbar, IconButton, Table, TableHead, TableRow, TableCell, TableBody, Box,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useEffectAsync } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PositionValue from '../common/components/PositionValue';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
import StatBox from '../common/components/StatBox';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import EarbudsBatteryIcon from '@mui/icons-material/EarbudsBattery';
import {
  formatVoltage, formatNumber, formatTime, formatNumericHours,
  } from '../common/util/formatter';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import ProgressCircle from '../common/components/ProgressCircle';
import dayjs from 'dayjs';
import LineChartAttributesToday from '../common/components/LineChartAttributesToday';
import ReplayPageDB from './ReplayPageDB';
import useMediaQuery from '@mui/material/useMediaQuery';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    overflow: 'auto',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

const PositionDashPage = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const displaybox = desktop ? 'grid' : 'column';
  const gcolgraph = desktop ? 'repeat(12, 1fr)' : 'repeat(5, 1fr)';

  const server = useSelector((state) => state.session.server);
  const serverDarkMode = server?.attributes?.darkMode;

  const positionAttributes = usePositionAttributes(t);

  const { id } = useParams();
  const deviceId = useSelector((state) => state.devices.selectedId);
  const from =  dayjs().startOf('day');
  const to = dayjs().endOf('day');

  const hours12 = false;
  
  const [item, setItem] = useState();
  const [hours, setHours] = useState();
  const [fuel, setFuel] = useState();
  const [power, setPower] = useState();
  const [ignition, setIgnition] = useState(false);
  const [battery, setBattery] = useState();
  const [fixtime, setFixtime] = useState();
  const [workhours, setWorkhours] = useState(0);

  const workprogress = (workhours / 3600000) / 24 ;

  //const [uniqueid, setUniqueid] = useState();
  //const [deviceimg, setDeviceimg] = useState();

  //const theme = useTheme();
  //const colors = tokens(theme.palette.mode);

  const colors = ( serverDarkMode ? "#1F2A40" : "#e0e0e0" ) // "#e0e0e0"; //"inherit"; e0e0e0 , 1F2A40
  const coloricon = "#3da58a";

  useEffectAsync(async () => {
    if (id) {
      const response = await fetch(`/api/positions?id=${id}`);
      if (response.ok) {
        const positions = await response.json();
        if (positions.length > 0) {
          setItem(positions[0]);
          setHours(positions[0].attributes.hours);
          setFuel(positions[0].attributes.fuel);
          setPower(positions[0].attributes.power);
          setBattery(positions[0].attributes.battery);
          setFixtime(positions[0].fixTime);
          setIgnition(positions[0].attributes.ignition);
        }
      } else {
        throw Error(await response.text());
      }

      const sum = await fetch(`/api/reports/summary?deviceId=${deviceId}&from=${from.toISOString()}&to=${to.toISOString()}`,{
          headers: { Accept: 'application/json' },
      });
      if (sum.ok) {
        const sumdata = await sum.json();
        if (sumdata.length > 0) {
          setWorkhours(sumdata[0].engineHours);
        }
      } else {
        throw Error(await sum.text());
      }

    }
  }, [id]);

  const deviceName = useSelector((state) => {
    if (item) {
      const device = state.devices.items[item.deviceId];
      if (device) {
        return device.name;
      }
    }
    return null;
  });

  const deviceImage = useSelector((state) => {
    if (item) {
      const device = state.devices.items[item.deviceId];
      if (device) {
        return device.attributes.deviceImage;
      }
    }
    return null;
  });
  
  const uniqueid = useSelector((state) => {
    if (item) {
      const device = state.devices.items[item.deviceId];
      if (device) {
        return device.uniqueId;
      }
    }
    return null;
  });

  const pathdeviceImage = '/api/media/' + uniqueid + '/' + deviceImage;

  const formatValue = (item, key) => {
    switch (key) {
      case 'engineHours':
        return formatNumericHours(item, t);
      case 'fuel':
        if (typeof item === 'number') {
          return formatNumber(item,1) + ' %';
        }
        else {
          return '-';
        }
      case 'power':
      case 'battery':
        if (typeof item === 'number') {
          return formatVoltage(item.toFixed(1),t);
        }
        else {
          return '-';
        }
      case 'fixTime':
        return formatTime(item, 'seconds', hours12);
      case 'ignition':
        return (item ? t('eventIgnitionOn') : t('eventIgnitionOff'));
      default:
        return item;
    }
  };


  return (
    <div className={classes.root}>
      <AppBar position="sticky" color="inherit" spacing={10}>
        <Toolbar>
          <IconButton color="inherit" edge="start" sx={{ mr: 2 }} onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Stack direction="row" spacing={2} >
            <Avatar alt={deviceName} src={pathdeviceImage}/>
            <Typography variant="h6">
              {deviceName + ' (' + formatValue(fixtime,'fixTime') + ')'} 
            </Typography>
          </Stack>
        </Toolbar>
      </AppBar>
      <div className={classes.root}>
        <Box m="10px" >
          {/** Row 1 stage box for Static current data */}
          <Box
            display={displaybox}
            gridTemplateColumns="repeat(12, 1fr)"
            gridAutoRows="120px"
            gap="15px"
          >
            <Box
              gridColumn="span 3"
              backgroundColor={colors}
              display="flex"
              alignItems="center"
              justifyContent="center"
              m="-5px"
            >
              <StatBox
                title={formatValue(hours, "engineHours")}
                subtitle={t('reportEngineHours')}
                icon={
                  <AvTimerIcon
                    sx={{ color: coloricon, fontSize: "45px" }}
                  />
                }
              />
            </Box>
            {!desktop && (<Box m="10px"/>)}
            <Box
              gridColumn="span 3"
              backgroundColor={colors}
              display="flex"
              alignItems="center"
              justifyContent="center"
              m="-5px"
            >
              <StatBox
                title={formatValue(fuel, "fuel")}
                subtitle={t('positionFuel')}
                icon={
                  <LocalGasStationIcon
                    sx={{ color: coloricon, fontSize: "45px" }}
                  />
                }
              />
            </Box>
            {!desktop && (<Box m="10px"/>)}
            <Box
              gridColumn="span 3"
              backgroundColor={colors}
              display="flex"
              alignItems="center"
              justifyContent="center"
              m="-5px"
            >
              <StatBox
                title={formatValue(power, "power")}
                subtitle={t('positionPower')}
                icon={
                  <BatteryChargingFullIcon
                    sx={{ color: coloricon, fontSize: "45px" }}
                  />
                }
              />
            </Box>
            {!desktop && (<Box m="10px"/>)}
            <Box
              gridColumn="span 3"
              backgroundColor={colors}
              display="flex"
              alignItems="center"
              justifyContent="center"
              m="-5px"
            >
              <StatBox
                title={formatValue(battery, "battery")}
                subtitle={t('positionBattery') + ' device'}
                icon={
                  <EarbudsBatteryIcon
                    sx={{ color: coloricon, fontSize: "45px" }}
                  />
                }
              />
            </Box>
          </Box>
          {/** Row 2 for Line Chart */}
          <Box m="15px"/>
          <Box
          display="grid"//{displaybox}
          gridTemplateColumns={gcolgraph}
          gridAutoRows="110px"
          gap="15px"
          >
            {/**Spent Fuel Chart */}
            <Box
              gridColumn="span 5"
              gridRow="span 2"
              backgroundColor={colors}
              m="-5px"
              p="0 10px"
            >
              <Typography
                variant="h6"
                fontWeight="600"
                color={coloricon}
              >
                {t('reportSpentFuel') + ' (%)'} 
              </Typography>
              <LineChartAttributesToday attr='fuel' min={0} max={100} interpola='monotone' ></LineChartAttributesToday>
            </Box>

            {/**Engine on (IG index) chart */}
            <Box
              gridColumn="span 5"
              gridRow="span 2"
              backgroundColor={colors}
              m="-5px"
              p="0 10px"
            >
              <Typography
                variant="h6"
                fontWeight="600"
                color={coloricon}
              >
                {t('eventIgnitionOn')} 
              </Typography>
              <LineChartAttributesToday attr='index' min={0} max={1.5} interpola='step' yaxistick={false} ></LineChartAttributesToday>
            </Box>

            {/**Hours today */}
            <Box
              gridColumn={desktop ? 'span 2':'span 5'}
              gridRow="span 2"
              backgroundColor={colors}
              m="-5px"
            >
              <Box
                mt="5px"
                p="0 10px"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="h6"
                  fontWeight="600"
                  color={coloricon}
                >
                  {t('positionHours')+ ' ('+t('reportToday') + ')'}
                </Typography>
              </Box>
              <Box m="20px 0 0 0" p="0 30px" align='center'>
                <ProgressCircle progress={workprogress.toString()}></ProgressCircle>
                <Typography
                    variant="h6"
                    fontWeight="600"
                    align='center'
                  >
                    {formatValue(workhours, "engineHours")}
                  </Typography>
                  <Box align='right'>
                    <Typography
                      variant="h7"
                      fontWeight="400"
                      align='right'
                    >
                      {formatValue(ignition,"ignition")}
                    </Typography>
                  </Box>
              </Box>
            </Box>
          </Box>

          {/** Row 3 for Map his */}
          <Box m="15px"/>
          <Box
          display="grid"
          gridTemplateColumns={gcolgraph}
          gridAutoRows="140px"
          gap="15px"
          >
             {/**Box data1 Position Replay*/}
            <Box
              gridColumn={desktop ? 'span 4':'span 5'}
              gridRow="span 2"
              backgroundColor={colors}
              m="-5px"
              p="0 10px"
              height="310x"
            >
              <Typography
                variant="h6"
                fontWeight="600"
                color={coloricon}
              >
                {t('reportReplay')} 
              </Typography>
              <Box 
              height="225px" 
              m="-5px 0 0 0" 
              p="0 -10px" 
              backgroundColor={colors} >
                <ReplayPageDB></ReplayPageDB>
              </Box>
            </Box>

             {/**Box data2 RPM*/}
            <Box
              gridColumn={desktop ? 'span 4':'span 5'}
              gridRow="span 2"
              backgroundColor={colors}
              m="-5px"
              p="0 10px"
            >
              <Typography
                variant="h6"
                fontWeight="600"
                color={coloricon}
              >
              {t('positionRpm')} 
              </Typography>
              <LineChartAttributesToday attr='rpm' min={0} max={6000} ></LineChartAttributesToday>
            </Box>
            
            {/**Box data3 Fuel Consump*/}
            <Box
              gridColumn={desktop ? 'span 4':'span 5'}
              gridRow="span 2"
              backgroundColor={colors}
              m="-5px"
              p="0 10px"
            >
              <Typography
                variant="h6"
                fontWeight="600"
                color={coloricon}
              >
              {t('positionFuelConsumption') + ' (' + t('sharedLiterPerHourAbbreviation') + ')'} 
              </Typography>
              <LineChartAttributesToday attr='fuelConsumption' min={0} max={50} ></LineChartAttributesToday>
            </Box>
          </Box>
        </Box>
        <Container maxWidth="sm">
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('stateName')}</TableCell>
                  <TableCell>{t('sharedName')}</TableCell>
                  <TableCell>{t('stateValue')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {item && Object.getOwnPropertyNames(item).filter((it) => it !== 'attributes').map((property) => (
                  <TableRow key={property}>
                    <TableCell>{property}</TableCell>
                    <TableCell><strong>{positionAttributes[property]?.name}</strong></TableCell>
                    <TableCell><PositionValue position={item} property={property} /></TableCell>
                  </TableRow>
                ))}
                {item && Object.getOwnPropertyNames(item.attributes).map((attribute) => (
                  <TableRow key={attribute}>
                    <TableCell>{attribute}</TableCell>
                    <TableCell><strong>{positionAttributes[attribute]?.name}</strong></TableCell>
                    <TableCell><PositionValue position={item} attribute={attribute} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Container>
      </div>
    </div>
  );
};

export default PositionDashPage;
